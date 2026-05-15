using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public AdminController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Admin Panel Data
        [Authorize(Roles = "Admin")]
        [HttpGet("AllStates")]
        public async Task<IActionResult> GetTotalStats()
        {
            // اجمالى عدد المستخدمين 
            var UserCount = await _userManager.Users.CountAsync();
            // اجمالى عدد الطلبات
            var OrderCount = await _context.Orders.CountAsync();
            // اجمالى الارباح من كل الطلبات 
            var totalRevenue = await _context.Orders.SumAsync(o => o.TotalPrice);

            return Ok(new
            {
                UserCount = UserCount,
                OrderCount = OrderCount,
                TotalRevenue = totalRevenue
            });
        }
        #endregion

        #region All Users For Admin Panel 
        [Authorize(Roles = "Admin")]
        [HttpGet("AllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var Users = await _userManager.Users
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.UserName })
                .ToArrayAsync();
            return Ok(Users);
        }
        #endregion

        #region Disable User (Admin Only)
        [HttpDelete("Disable_User/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DisableUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            user.IsDeleted = true;
            await _userManager.UpdateAsync(user);
            return Ok(new { message = "User account disabled successfully" });
        }
        #endregion

        #region All Orders For Admin Panel 
        [Authorize(Roles = "Admin")]
        [HttpGet("AllOrders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    // بيانات الأوردر نفسه
                    o.Id,
                    o.ShppingAddress,
                    o.OrderDate,
                    o.TotalPrice, 
                    o.OrderStatus,
                    // هنا بقى بنختار بيانات اليوزر اللي محتاجينها بس
                    CustomerName = o.User.FirstName + " " + o.User.LastName,
                    CustomerEmail = o.User.Email,
                    CustomerAddress = o.User.Address,
                    CustomerPhone = o.User.PhoneNumber
                })
                .ToListAsync();  
            return Ok(orders);
        }
        #endregion

        #region Order Status 
        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateOrderStatus/{id}")]
        public async Task<IActionResult> UpdateStatus(int id , [FromBody] string newStatus)
        {
            var Order = await _context.Orders.FindAsync(id);
            if (Order == null)
            {
                return NotFound("Order not found");
            }
            Order.OrderStatus = newStatus; // "Shipped", "Delivered", "Cancelled"
            await _context.SaveChangesAsync();
            return Ok(new { message = "Order status updated successfully", Status = newStatus });
        }
        #endregion

    }
}
