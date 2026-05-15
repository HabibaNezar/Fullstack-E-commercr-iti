namespace LoginAndRegister.Services
{
    public interface IPaymentService
    {
        // دي الـ Method اللي كتبنا الـ Logic بتاعها
        // بتاخد الـ userId وترجع الـ ClientSecret اللي Stripe بعته
        Task<string> CreateOrUpdatePaymentIntent(string userId);
    }
}
