namespace LoginAndRegister.Services
{
    public interface IEmailSender
    {
        // أي حد عايز يبعت إيميل لازم يكون عنده ميثود اسمها SendEmailAsync
        Task SendEmailAsync(string email, string subject, string message);
        // SMTP : Simple Mail Transfer Protocol
    }
}
