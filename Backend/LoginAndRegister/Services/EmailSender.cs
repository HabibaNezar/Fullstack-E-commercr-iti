using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace LoginAndRegister.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration _config;
        public EmailSender(IConfiguration config) => _config = config;
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            // بنقرأ سيكشن الإعدادات من الـ Configuration
            // الـ Configuration أوتوماتيكياً بيدور في الـ Secrets الأول قبل الـ appsettings
            var mailSettings = _config.GetSection("MailSettings");

            var emailMessage = new MimeMessage();
            // يفضل تقرأي الـ Email المرسل برضه من الـ Settings عشان لو اتغير
            emailMessage.From.Add(new MailboxAddress(mailSettings["DisplayName"], mailSettings["Mail"]));
            emailMessage.To.Add(MailboxAddress.Parse(email));
            emailMessage.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = message };
            emailMessage.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();

            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

            await smtp.ConnectAsync(mailSettings["Host"], int.Parse(mailSettings["Port"]), SecureSocketOptions.StartTls);

            // هنا السحر بيحصل: mailSettings["Password"] هيجيب الـ Key من الـ Secrets اللي على جهازك
            await smtp.AuthenticateAsync(mailSettings["Mail"], mailSettings["Password"]);

            await smtp.SendAsync(emailMessage);
            await smtp.DisconnectAsync(true);
        }
    }
}
