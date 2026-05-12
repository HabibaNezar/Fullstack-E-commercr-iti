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
            var mailSettings = _config.GetSection("MailSettings");
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress(mailSettings["DisplayName"], "egenedy0@gmail.com"));
            emailMessage.To.Add(MailboxAddress.Parse(email));
            emailMessage.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = message };
            emailMessage.Body = builder.ToMessageBody();
            // SmtpClient : دا اللى هينقل الرساله
            using var smtp = new SmtpClient();

            // بنقول للـ Client: اقبل أي شهادة أمان من غير ما تدقق وراها
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

            // هنا بنروح لسيرفر Brevo على بورت 587 وبنبدأ "المصافحة" ونقوله عايزين نستخدم تشفير StartTls.
            await smtp.ConnectAsync(mailSettings["Host"], int.Parse(mailSettings["Port"]), SecureSocketOptions.StartTls);
           // لو السطر ده نجح، السيرفر بيسمح لنا نبعت من خلاله.
            await smtp.AuthenticateAsync(mailSettings["Mail"], mailSettings["Password"]);
            // الايميل بيتبعت بعد السطر دا
            await smtp.SendAsync(emailMessage);
            // هنا بنقفل الاتصال
            await smtp.DisconnectAsync(true);
        }
    }
}
