using LoginAndRegister.AppContext;
using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using LoginAndRegister.Services;
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
        private readonly IPaymentService _paymentService;
        public OrdersController(AppDbContext context , IPaymentService paymentService)
        {
            _context = context; 
            _paymentService = paymentService;
        }
        #region Check Out End Point
        [HttpPost("CheckOut")]
        public async Task<IActionResult> CheckOut(string shippingAddress, string paymentMethod)
        {
            var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var CartItems = await _context.CartItems
                .Where(c => c.AppUserId == UserId)
                .Include(c => c.Product).ToListAsync();

            if (CartItems == null || !CartItems.Any())
            {
                return BadRequest(new { message = "Cart Is Empty !!" });
            }
            decimal GrandTotalPrice = CartItems.Sum(item => item.Quantity * item.Product.ActualPrice);
            var Order = new Order
            {
                AppUserId = UserId,
                OrderDate = DateTime.Now,
                OrderStatus = "Pending",
                TotalPrice = GrandTotalPrice,
                ShppingAddress = shippingAddress,
                PaymentMethod = paymentMethod == "Card" ? PaymentMethod.Card : PaymentMethod.COD
            };

            _context.Orders.Add(Order);
            await _context.SaveChangesAsync();
            // 1. لفي على كل المنتجات وضيفيهم كـ OrderItems الأول
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
                    PriceAtPurchase = item.Product.ActualPrice
                };
                _context.orderItems.Add(OrderItem);
                // لو كاش، بننقص المخزن دلوقتي
                if (paymentMethod == "COD")
                {
                    item.Product.StockQuantity -= item.Quantity;
                }
            }
            // 2. هنا بقى بنسيف كل الـ OrderItems اللي اتضافت فوق مرة واحدة
            await _context.SaveChangesAsync();
            if (paymentMethod == "COD")
            {
                _context.CartItems.RemoveRange(CartItems); // مسح السلة
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Order Placed (Cash)!", OrderId = Order.Id });
            }
            else
            {
                // طلب الـ Secret من Stripe
                var clientSecret = await _paymentService.CreateOrUpdatePaymentIntent(UserId);
                //   هنقص الـ PaymentIntentId من الـ clientSecret
                if (!string.IsNullOrEmpty(clientSecret))
                {
                    // بناخد النص اللي قبل كلمة "_secret_"
                    Order.PaymentIntentId = clientSecret.Split("_secret_")[0];
                }
                // نسيف الأوردر بعد ما حطينا فيه الـ ID بتاع Stripe
                await _context.SaveChangesAsync();
                // ملاحظة: مش بنمسح السلة هنا، بنسيبها للـ Webhook
                return Ok(new
                {
                    Message = "Order Created. Complete payment via Stripe...",
                    OrderId = Order.Id,
                    ClientSecret = clientSecret
                });
            }
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
                        ProductId = oi.ProductId ?? 0,
                        ProductName = oi.Product != null ? oi.Product.Name : "Unknown Product", // حماية إضافية لو المنتج ممسوح                        Quantity = oi.Quantity,
                        PriceAtPurchase = oi.PriceAtPurchase
                    }).ToList()
                }).OrderByDescending(o => o.OrderDate).ToListAsync();
            return Ok(Orders);
        }
        #endregion
    }
}
