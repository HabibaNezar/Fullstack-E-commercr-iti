using LoginAndRegister.AppContext;
using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }
        #region CRUD Operations For Categories

        #region Get All Categories End Point
        [HttpGet("Get_All_Categories")]
        public async Task<IActionResult> GetAll()
        {
            var Categories = await _context.Categories.ToListAsync();
            return Ok(Categories);
        }
        #endregion

        #region Create New Category (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpPost("Add_New_Category")]
        public async Task<IActionResult> CreateNewCat(CategoryDto categoryDto)
        {
            if (ModelState.IsValid)
            {
                Category category = new Category
                {
                    Name = categoryDto.Name,
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Category added successfully!" });
            }
            return BadRequest(ModelState);
        }
        #endregion

        #region Update Categories (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryDto categoryDto)
        {
            // هنا هدور على الكاتيجورى
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found!" });
            }
            // هنا بشوف لو اسم الكاتيجورى دى موجود قبل كدا
            var IsNameExist = await _context.Categories
                .AnyAsync(c => c.Name == categoryDto.Name && c.Id != id);
            if (IsNameExist)
            {
                return BadRequest(new { message = "This Category Name Already Exsits !" });
            }
            // هنا لم التحديث يتم 
            category.Name = categoryDto.Name;
            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Category updated successfully!" });
            }
            // لو حصل ايرور غير متوقع
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An Error Occured During Update", error = ex.Message });
            }
        }
        #endregion

        #region Delete Category (Admins & Sellers)
        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
            {
               // اول حاجه بتأكد ان الكاتيجورى دى موجود
               var category = await _context.Categories
                   .Include(c => c.Products) // هجيب القسم ومعاه قايمة منتجاته
                   .FirstOrDefaultAsync(c => c.Id == id);
                if (category == null)
                {
                    return NotFound(new { message = "Category not found!" });
                }
            // هتأكد الاول ان الكاتيجورى دى فاضية
            if (category.Products.Any())
            {
                return BadRequest(new
                {
                    message = $"Can not delete '{category.Name}'category,because it has {category.Products.Count} products, Delete products or transfer it first !"
                });
            }
            // هنا بمسح الكاتيجورى بعد ما اتأكدت انها ينفع تتمسح
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category Deleted successfully" });
        }
        #endregion

        #endregion
        }
    }
