using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace LoginAndRegister.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public PaymentService(AppDbContext context , IConfiguration configuration)
        {
            _configuration = configuration;
            _context = context;
        }
        public async Task<string> CreateOrUpdatePaymentIntent(string userId)
        {
            // تثبيت المفتاح السرى 
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
            // حساب اجمالى المبلغ اللى فى السلة
            var cartitems =await _context.CartItems
                .Where(c => c.AppUserId == userId)
                .Include(c => c.Product)
                .ToListAsync();
            if (!cartitems.Any()) return null;

            var totalAmount = cartitems.Sum(item => item.Quantity * item.Product.Price);
            // 3. إعداد بيانات الدفع لـ Stripe
            var service = new PaymentIntentService();
            PaymentIntent intent;

            // بنضرب في 100 لأن Stripe بيتعامل بالقرش/السنت
            // بنحول الرقم ل long عشان مش بيقبل ارقام فيها فواصل
            var amountInCents = (long)(totalAmount * 100);

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "usd", // أو egp حسب حسابك
                // هنا بقوله انى بقبل دفع بالكارت
                PaymentMethodTypes = new List<string> { "card" }
            };

            // 4. طلب الـ Intent من Stripe
            intent = await service.CreateAsync(options);

            // 5. بنرجع الـ ClientSecret عشان الفرونت إند يستخدمه
            return intent.ClientSecret;
        }
    }
}
