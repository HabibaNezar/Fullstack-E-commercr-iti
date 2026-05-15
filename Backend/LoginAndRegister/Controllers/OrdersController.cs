using LoginAndRegister.AppContext;
using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrdersController(AppDbContext context)
        {
            _context = context; 
        }
        #region Check Out End Point
        [HttpPost("CheckOut")]
        public async Task<IActionResult> CheckOut(string shippingAddress)
        {
            // هنا هجيب اليوزر
            var UserId = User.FindFirstValue (ClaimTypes.NameIdentifier);
            // هنجيب محتويات الكارت بتاع اليوزر
            var CartItems = await _context.CartItems
                .Where(c => c.AppUserId == UserId)
                .Include(c => c.Product).ToListAsync();
            // بتأكد ان الكارت فيه محتوى
            if (CartItems == null || !CartItems.Any())
            {
                return BadRequest(new { message = "Cart Is Empty !!" });
            }
            // نحسب اجمالى سعر الاوردر كله
            decimal GrandTotalPrice = CartItems.Sum(item => item.Quantity * item.Product.ActualPrice);
            // نعمل الاوردر نفسه بقا 
            var Order = new Order
            {
                AppUserId = UserId,
                OrderDate = DateTime.Now,
                OrderStatus = "Pending",
                TotalPrice = GrandTotalPrice,
                ShppingAddress = shippingAddress
            };
            // نضيف بقا الاوردر ف الجدول
            _context.Orders.Add(Order);
            // عملنا سيف هنا بدرى عشان عشان الاوردر يتسيف فى الداتا بيز وياخد id 
            await _context.SaveChangesAsync();

            // تفكيك السله وتحويل محتوياتها الى items
            foreach (var item in CartItems) 
            {
                if (item.Product.StockQuantity < item.Quantity)
                {
                    return BadRequest(new { message = $"Quantity of {item.Product.Name} is not available" });
                }
                var OrderItem = new OrderItem
                {
                    OrderId = Order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    PriceAtPurchase = item.Product.ActualPrice // عشان اخلى سعر الاوردر ثابت حتى لو اتغير بعد كدا
                };
                _context.orderItems.Add(OrderItem);
                // بنقص الكمية الباقية
                item.Product.StockQuantity -= item.Quantity;
            }
            // بعدين نمسح الكارت
            //_context.CartItems.RemoveRange(CartItems);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Order Placed Successfully !", OrderId = Order.Id,  Total= GrandTotalPrice });
        }
        #endregion

        #region Get My Orders
        [HttpGet("My-Orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var Orders = await _context.Orders
                .Where(o => o.AppUserId == UserId)
                .Include(o => o.OrderItem)
                .ThenInclude(io => io.Product)
                .Select(o => new OrderViewDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    OrderStatus = o.OrderStatus,
                    TotalPrice = o.TotalPrice,
                    ShippingAddress = o.ShppingAddress,
                    Items = o.OrderItem.Select(oi => new OrderItemViewDto
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.Name,
                        Quantity = oi.Quantity,
                        PriceAtPurchase = oi.PriceAtPurchase
                    }).ToList()
                }).OrderByDescending(o => o.OrderDate).ToListAsync();
            return Ok(Orders);
        }
        #endregion
    }
}
