using LoginAndRegister.AppContext;
using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        public ReviewsController(AppDbContext context , UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Add Review
        [HttpPost("AddReview")]
        public async Task<IActionResult> AddReview(ReviewDto reviewDto)
        {
            // أول حاجه هنجيب ال id بتاع اليوزر
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // نتأكد الاول ان المنتج موجود
            var product = _context.Products.FindAsync(reviewDto.ProductId);
            if (product == null)
            {
                return NotFound("Product not found");
            }
            var review = new Review
            {
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                ProductId = reviewDto.ProductId,
                UserId = UserId
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok("Review added successfully");
        }
        #endregion
    }
}
