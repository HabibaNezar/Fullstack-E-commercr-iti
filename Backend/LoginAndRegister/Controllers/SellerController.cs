using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Seller")]
    public class SellerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        public SellerController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Seller Sales Status
        [HttpGet("Sales_Status")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> GetTotalSales()
        {
            // هنجيب ال id 
            var SellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // بنحسب مجموع المبيعات من جدول تفاصيل الطلبات 
            // بشرط إن المنتج يكون بتاع البائع ده
            var TotalSales = await _context.orderItems
                .Where(o => o.Product.SellerId == SellerId)
                .SumAsync(o => o.PriceAtPurchase * o.Quantity);
            return Ok(new { TotalRevenue = TotalSales });
        }
        #endregion

        #region Get Low Stock Items
        [HttpGet("LowStockAlert")]
        public async Task<IActionResult> GetLowStock()
        {
            // هنجيب ال id 
            var SellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // هنجيب المنتجات اللى عددها اقل من 5 مثلا
            var LowStockProducts = await _context.Products
                .Where(p => p.SellerId == SellerId && p.StockQuantity < 5)
                .Select(p => new { p.Name, p.StockQuantity })
                .ToArrayAsync();
            return Ok(LowStockProducts);
        }
        #endregion

        #region Seller Orders
        [HttpGet("MyOrders")]
        public async Task<IActionResult> GetMyProductsOrders()
        {
            var SellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orders = await _context.orderItems
                .Where(o => o.Product.SellerId == SellerId)
                .Select(od => new
                {
                    OrderId = od.OrderId,
                    ProductName = od.Product.Name,
                    Quantity = od.Quantity,
                    UnitPrice = od.PriceAtPurchase,
                    CustomerName = od.Order.User.FirstName + " " + od.Order.User.LastName,
                    OrderDate = od.Order.OrderDate,
                    Status = od.Order.OrderStatus
                }).ToArrayAsync();
            return Ok(orders);
        }
        #endregion

        #region Top Selling Products
        [HttpGet("TopSellingProducts")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var SellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var topProducts = await _context.orderItems
        .Where(od => od.Product.SellerId == SellerId)
        .GroupBy(od => od.Product.Name)
        .Select(g => new
        {
            // Key : القيمة اللي إحنا جمعنا على أساسها
            ProductName = g.Key,
            TotalSold = g.Sum(od => od.Quantity),
            TotalRevenue = g.Sum(od => od.PriceAtPurchase * od.Quantity)
        })
        .OrderByDescending(x => x.TotalSold)
        .Take(5) // نرجع أول 5 منتجات بس
        .ToListAsync();
         return Ok(topProducts);
        }
        #endregion
    }
}
