using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        public WishlistController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        #region Add To WishList
        [HttpPost("Add_To_WishList")]
        public async Task<IActionResult> AddToWishList(int productId)
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // لو موجود قبل كدا مش هنضيفه
            var exists = await _context.Wishlist.AnyAsync(w => w.ProductId == productId && w.AppUserId == UserId);
            if (exists)
            {
                return BadRequest("Product already in wishlist");
            }
            var Item = new Wishlist
            {
                ProductId = productId,
                AppUserId = UserId
            };
            _context.Wishlist.Add(Item);
            await _context.SaveChangesAsync();
            return Ok("Item Added to Wishlist");
        }
        #endregion

        #region Get My WishList
        [HttpGet("Get_My_WishList")]
        public async Task<IActionResult> GetMyWishList()
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var Items = await _context.Wishlist
                .Where(w => w.AppUserId == UserId)
                .Include(w => w.Product)
                .Select(w => new
                {
                    w.ProductId,
                    w.Product.Name,
                    w.Product.Price,
                    w.Product.Description
                }).ToListAsync();
            return Ok(Items);
        }
        #endregion

        #region Remove From WishList
        [HttpDelete("Remove_From_Wishlist/{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // بندور على المنتج في الـ Wishlist الخاصة باليوزر ده
            var wishlistItem = await _context.Wishlist
                .FirstOrDefaultAsync(w => w.AppUserId == userId && w.ProductId == productId);
            if (wishlistItem == null)
            {
                return NotFound(new { message = "Product not found in your wishlist" });
            }
            _context.Wishlist.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product removed from wishlist successfully" });
        }
        #endregion

        #region Move To Cart
        [HttpPost("Move_To_Cart/{productId}")]
        public async Task<IActionResult> MoveToCart(int productId)
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // أول حاجه نتأكد ان النتج موجود فى الwishlist
            var wishlistItem = await _context.Wishlist
                 .FirstOrDefaultAsync(w => w.AppUserId == UserId && w.ProductId == productId);
            if (wishlistItem == null)
                return NotFound(new { message = "Product not found in your wishlist" });
            //  نشوف لو المنتج موجود في الكارت قبل كدة عشان نزود الكمية بس
            var existingCartItem = await _context.CartItems
                 .FirstOrDefaultAsync(c => c.AppUserId == UserId && c.ProductId == productId);
            if (existingCartItem != null)
            {
                existingCartItem.Quantity += 1;
            }
            else
            {
                //  لو مش موجود، نعمل سطر جديد في الكارت
                var newCartItem = new CartItems
                {
                    ProductId = productId,
                    AppUserId = UserId,
                    Quantity = 1
                };
                _context.CartItems.Add(newCartItem);
            }
            //   نمسحه من الـ wishList
            _context.Wishlist.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product moved to cart successfully!" });
        }    
        #endregion
    }
}
