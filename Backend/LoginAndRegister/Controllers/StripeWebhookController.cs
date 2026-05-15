using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using LoginAndRegister.AppContext;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // ملحوظة: مش حاطين [Authorize] هنا لأن Stripe هو اللي بينادي الـ Endpoint دي مش اليوزر
    public class StripeWebhookController : ControllerBase
    {
        private readonly AppDbContext _context;
        public StripeWebhookController(AppDbContext context)
        {
            _context = context;
        }
        #region ProcessWebhook
        [HttpPost]
        public async Task<IActionResult> ProcessWebhook()
        {
            // 1. بنقرا البيانات اللي Stripe باعتها في الـ Body بتاع الـ Request
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                // بنحول النص اللي جاي لـ Event يفهمه السي شارب
                var stripeEvent = EventUtility.ParseEvent(json);
                // 2. بنتأكد إن نوع الإشعار هو "نجاح عملية الدفع" (PaymentIntentSucceeded)
                if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    // بناخد الـ ID بتاع المعاملة اللي Stripe بعتهالنا
                    var stripePaymentIntentId = paymentIntent.Id;
                    // 3. ندور في الداتابيز على الأوردر اللي مربوط بنفس الـ ID ده
                    var order = await _context.Orders
                        .FirstOrDefaultAsync(o => o.PaymentIntentId == stripePaymentIntentId && o.OrderStatus == "Pending");
                    if (order != null)
                    {
                        // أ) نغير حالة الأوردر لـ Paid لأن الفلوس وصلت فعلاً
                        order.OrderStatus = "Paid";
                        // ب) نجيب سلة اليوزر ده عشان خلاص اشترى المنتجات اللي فيها
                        var cartItems = await _context.CartItems
                            .Where(c => c.AppUserId == order.AppUserId)
                            .Include(c => c.Product)
                            .ToListAsync();
                        // ج) ننقص الكمية من المخزن (الـ Stock) ونمسح السلة
                        foreach (var item in cartItems)
                        {
                            if (item.Product != null)
                            {
                                item.Product.StockQuantity -= item.Quantity; // بنخصم من المخزن
                            }
                        }
                        _context.CartItems.RemoveRange(cartItems); // بنفضي السلة
                        // نسيف كل التعديلات دي في الداتابيز
                        await _context.SaveChangesAsync();
                    }
                }
                // بنرد على Stripe ونقوله "تمام وصلنا الإشعار" عشان ميفضلش يبعته تاني
                return Ok();
            }
            catch (Exception ex)
            {
                // لو حصل أي مشكلة في السيرفر بنرجع BadRequest
                return BadRequest();
            }
        }
        #endregion
    }
}