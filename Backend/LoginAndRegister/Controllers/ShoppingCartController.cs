using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ShoppingCartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        public ShoppingCartController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Add To Cart
        [HttpPost("Add_To_Cart")]
        public async Task<IActionResult> AddToCart(int ProductId, int Quantity)
        {
            // مش هينفع اخد ال فى الباراميترزuser id
            // الافضل انى اجيبه من ال token كدا هيكون امان اكتر 
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // اتأكد الاول ان اليوزر عامل login
            if (UserId == null)
            {
                return Unauthorized(new { message = "Log in First !!" });
            }

            // نشوف لو المنتج دا موجود فى ال cart قبل كدا
            var ExistingItem = _context.CartItems.FirstOrDefault(p => p.AppUserId == UserId && p.ProductId == ProductId);
            if (ExistingItem != null)
            {
                // لو موجود هنزود الكمية 
                // بنمنع تكرار نفس المنتج في القائمة
                ExistingItem.Quantity += Quantity;
            }
            else
            {
                // لو مش موجود بقا نعمل سطر جديد
                var NewItem = new CartItems
                {
                    Quantity = Quantity,
                    ProductId = ProductId,
                    AppUserId = UserId
                };
                // نضيفه فى الداتا بيز
                _context.CartItems.Add(NewItem);
            }
            // نحفظ التعديلات
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product added to cart successfully!" });
        }
        #endregion

        #region Get Cart Items
        [HttpGet("Get_Cart_Items")]
        public async Task<IActionResult> GetMyCart()
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // بنستخدم .Include(p => p.Product) عشان يجيبلنا بيانات المنتج معاه (الاسم، السعر، إلخ)
            var CartItems = await _context.CartItems
                .Where(c => c.AppUserId == UserId)
                .Include(c => c.Product)
                .Select(c => new
                {
                    c.Id,
                    c.ProductId,
                    ProductName = c.Product.Name,
                    OriginalPrice = c.Product.Price, // السعر قبل الخصم
                    CurrentPrice = c.Product.ActualPrice, // السعر بعد الخصم - اللى هيتحاسب عليه
                    c.Quantity,
                    TotalItemPrice = c.Quantity * c.Product.ActualPrice // دى الحسبة النهائية
                }).ToListAsync();
            // هنا بحسب السعر النهائى بتاع الكارت كله
            var totalCartPrice = CartItems.Sum(x => x.TotalItemPrice);
            return Ok(new { items = CartItems, TotalPrice = totalCartPrice });
        }
        #endregion

        #region Remove From Cart
        [HttpDelete("Remove_Item/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var CartItem = await _context.CartItems.FirstOrDefaultAsync(c => c.AppUserId == UserId && c.ProductId == productId);
            if (CartItem != null)
            {
                return NotFound("Items Not Found In Cart !");
            }
            _context.CartItems.Remove(CartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Item removed successfully" });
        }
        #endregion

        #region Update Cart Quantity
        [HttpPut("UpdateQuantity")]
        public async Task<IActionResult> UpdateQuantity(int ProductId, int NewQuantity)
        {
            if (NewQuantity <= 0)
            {
                return BadRequest("Quantity must be at least 1");
            }
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var CartItems = await _context.CartItems.FirstOrDefaultAsync(c => c.AppUserId == UserId && c.ProductId == c.ProductId);
            if (CartItems == null) return NotFound("Item not found");
            CartItems.Quantity = NewQuantity;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Quantity updated successfully" });
        }
        #endregion

        #region Clear Cart
        [HttpDelete("ClearMyCart")]
        public async Task<IActionResult>ClearMyCart()
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var CartItems =await  _context.CartItems.Where(c => c.AppUserId == UserId ).ToListAsync();
            if (!CartItems.Any()) return BadRequest("Cart is already empty");
            _context.CartItems.RemoveRange(CartItems);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart cleared successfully" });
        }
        #endregion
    }
}
