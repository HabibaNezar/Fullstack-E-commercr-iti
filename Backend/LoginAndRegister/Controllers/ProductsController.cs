using LoginAndRegister.AppContext;
using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public ProductsController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            // دى اللى هتعرفنا مكان الفولدرات فى الجهاز
            _webHostEnvironment = webHostEnvironment;
        }
        #region CRUD Oprations For Products

        #region Add New Product (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpPost("Add_New_Product")]
        public async Task<IActionResult> AddNewProduct([FromForm] CreateProductDto createProductDto)
        {
            if (createProductDto.Image == null || createProductDto.Image.Length == 0)
            {
                return BadRequest("Please Upload the product image !");
            }
            // هنا بحددله المسار اللى هنسيف فيه الصور (wwwroot/Images)
            string uploadsfolder = Path.Combine(_webHostEnvironment.WebRootPath, "Images");

            // بعدين هنعمل اسم مميز للصوره عشان اسماء الصور متتكررش
            string UniqueName = Guid.NewGuid().ToString() + "_" + createProductDto.Image.FileName;
            // بعدين هندمج المسار مع اسم الصورة الجديد عشان يطلعلنا مسار الصوره بالكامل
            string filePath = Path.Combine(uploadsfolder, UniqueName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await createProductDto.Image.CopyToAsync(fileStream);
            }
            // هنا بقوله هاتلى ال id بتاع اليوزر اللى عامل لوج ان دلوقت
            var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentId))
            {
                return Unauthorized("Unauthorized User !");
            }            
            // تسجيل البيانات فى الداتا بيز
            Product newProduct = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                StockQuantity = createProductDto.StockQuantity,
                CategoryId = createProductDto.CategoryId,
                // هنا بضيف ال id بتاع ال seller بشكل تلقائى عشان يكون امان اكتر
                SellerId = currentId,
                ImagePath = UniqueName
            };
            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product Added successfully !", Product = newProduct });
        }
        #endregion

        #region Get All Products 
        [HttpGet("Get_All_Products")]
        public async Task<IActionResult> GetAllProducts()
        {
            // هنجيب كل المنتجات بالاقسام بتاعتها
            var products = await _context.Products
                .Include(p => p.Category).ToListAsync();
            // جملة select دى بدل ماعمل foreach طويله وصعبه
            // هنا بقوله عدى على كل منتج فى ال products 
            // ضفهولى فى ProductViewDto جديد عشان ابعته لليوزر
            var productDto = products.Select(p => new ProductViewDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                CategoryName = p.Category.Name,
                // اسم السيرفر + فولدر الصور + اسم الصورة
                // الصوره فى الداتا بيز متخزنة (name+extension) 
                // ولكن لم ابعتها لليوزر لازم ترجع URL كامل
                ImageUrl = $"{Request.Scheme}://{Request.Host}/Images/{p.ImagePath}"
            }).ToList();
            // كل دا بقا حطه فى list وابعته
            return Ok(productDto);
        }
        #endregion

        #region Get Product By Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound("Product Not Found !");
            }
            var productDto = new ProductViewDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                CategoryName = product.Category.Name,
                ImageUrl = $"{Request.Scheme}://{Request.Host}/{product.ImagePath}"
            };
            return Ok(productDto);
        }
        #endregion

        #region Delete Product (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            // فى الحاله دى هحتاج امسح المنتج من الهارد ديسك والداتا بيز 
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound("Product Not Found");
            }
            // مسح المنتج من الهارد ديسك
            if (!string.IsNullOrEmpty(product.ImagePath))
            {
                string filePath = Path.Combine(_webHostEnvironment.WebRootPath, "Images", product.ImagePath);
                // هنا بتأكد ان الفايل موجود عشان لو راح ملقهاش ميضربش ايرور
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            // مسح المنتج من الداتا بيز 
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = " Product Deleted successfully !" });
        }
        #endregion

        #region Update Product (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProduct updateProduct)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Product Not Found !");

            product.Name = updateProduct.Name;
            product.Price = updateProduct.Price;
            product.Description = updateProduct.Description;
            product.StockQuantity = updateProduct.StockQuantity;
            product.CategoryId = updateProduct.CategoryId;

            if (updateProduct.Image != null && updateProduct.Image.Length > 0)
            {
                //  مسح الصورة القديمة لو موجودة
                if (!string.IsNullOrEmpty(product.ImagePath))
                {
                    string oldFilePath = Path.Combine(_webHostEnvironment.WebRootPath, "Images", product.ImagePath);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
                
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "Images");
                string uniqueName = Guid.NewGuid().ToString() + "_" + updateProduct.Image.FileName;
                string fullPath = Path.Combine(uploadsFolder, uniqueName);

                using (var filestream = new FileStream(fullPath, FileMode.Create))
                {
                    await updateProduct.Image.CopyToAsync(filestream);
                }
                product.ImagePath = uniqueName;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product Updated successfully !" });
        }
        #endregion

        #endregion
    }
}

