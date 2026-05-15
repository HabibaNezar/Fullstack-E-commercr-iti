using LoginAndRegister.DTO;
using LoginAndRegister.Models;
using LoginAndRegister.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LoginAndRegister.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcountController : ControllerBase
    {
        public AcountController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager,
            IConfiguration configuration , IEmailSender emailSender)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
            this.configuration = configuration;
        }
        private readonly IEmailSender _emailSender;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration configuration;

        #region Register End Point
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterNewUser(DtoNewUser user)
        {
            if (ModelState.IsValid)
            {
                AppUser appUser = new()
                {
                    UserName = user.Email, // يفضل يكون كدا عشان اللوجن
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DisplayName = user.FirstName + " " + user.LastName,
                    Email = user.Email,
                    Address = user.Address,
                    PhoneNumber = user.PhoneNumber,
                    City = user.City,
                    CreatedAt = DateTime.Now
                };
                IdentityResult result = await _userManager.CreateAsync(appUser, user.Password);
                if (result.Succeeded)
                {
                    // 1. توليد التوكن الخاص بتأكيد الإيميل
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);

                    // 2. تجهيز رابط التأكيد الذي سيُرسل في الإيميل
                    // "ConfirmEmail" هو اسم الـ Endpoint اللي هنعملها تحت
                    // Url.Action: ميثود بتبني رابط كامل.
                    var confirmationLink = Url.Action("ConfirmEmail", "Acount",
                        new { userId = appUser.Id, token = token }, Request.Scheme);

                    // 3. محتوى الرسالة (HTML)
                    string emailBody = $@"
                <div style='font-family: Arial; padding: 20px; border: 1px solid #eee;'>
                    <h2 style='color: #2d3436;'>Welcome to our Store!</h2>
                    <p>Please confirm your account by clicking the button below:</p>
                    <a href='{confirmationLink}' style='background: #0984e3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Confirm My Account</a>
                </div>";

                    // 4. إرسال الإيميل فعلياً
                    await _emailSender.SendEmailAsync(appUser.Email, "Confirm Your Email", emailBody);

                    // إضافة الـ Role
                    // 1. شوفي اليوزر بعت كلمة "بائع" ولا "مشتري"؟ (لو مبعتش اعتبريه مشتري)
                    string assignedRole = string.IsNullOrEmpty(user.Role) ? "Customer" : user.Role;

                    // 2. تأكد إن الكلمة دي (بائع أو مشتري) متسجلة في "دفتر الأدوار" في الداتابيز
                    if (!await _roleManager.RoleExistsAsync(assignedRole))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(assignedRole));
                    }
                    // 3.  قولي للسيستم: "اربط اليوزر ده بالدور اللي اختاره"
                    await _userManager.AddToRoleAsync(appUser, assignedRole);

                    return Ok("Registration success! Please check your email to confirm your account.");
                }
                else
                {
                    foreach (var item in result.Errors)
                    {
                        ModelState.AddModelError("", item.Description);
                    }
                }
            }
            return BadRequest(ModelState);
        }
        #endregion

        #region Confirm Email
        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (userId == null || token == null)
            {
                return BadRequest("Invalid confirmation link.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded)
            {
                return Ok("Email confirmed successfully! You can now login.");
            }

            return BadRequest("Email confirmation failed.");
        }
        #endregion

        #region Login End Point
        [HttpPost("Login")]
        public async Task<IActionResult> Login(DtoLogin login)
        {
            if (ModelState.IsValid)
            {
                AppUser? user = await _userManager.FindByEmailAsync(login.Email);
                if (user != null)
                {
                    if (await _userManager.CheckPasswordAsync(user, login.Password))
                    {
                        if (!await _userManager.IsEmailConfirmedAsync(user))
                        {
                            return BadRequest("Confirm Your Email First!");
                        }
                        // لو اليوزر موجود بس معمول له Soft Delete نرفض الدخول
                        if (user != null && user.IsDeleted)
                        {
                            return BadRequest(new { message = "This account has been deleted/disabled." });
                        }

                        var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.GivenName, user.FirstName), // تعديل: أضفناهم للقائمة مباشرة
                    new Claim(ClaimTypes.Surname, user.LastName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };
                        var roles = await _userManager.GetRolesAsync(user);
                        foreach (var role in roles)
                        {
                            claims.Add(new Claim(ClaimTypes.Role, role.ToString()));
                        }
                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
                        var sc = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                        var Token = new JwtSecurityToken(
                            claims: claims,
                            issuer: configuration["Jwt:Issuer"],
                            audience: configuration["Jwt:Audience"],
                            expires: DateTime.Now.AddHours(1),
                            signingCredentials: sc
                        );
                        // نرجع البيانات بشكل واضح ومباشر
                        return Ok(new
                        {
                            Token = new JwtSecurityTokenHandler().WriteToken(Token),
                            Expiration = Token.ValidTo,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            Roles = roles
                        });
                    }
                    else
                    {
                        return Unauthorized("Invalid Password.");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "Email Is Invalid");
                }
            }
            return BadRequest(ModelState);
        }
        #endregion

        #region Auth Test
        [Authorize]
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("You are authorized!");
        }
        #endregion

        #region Test Roles
        [Authorize] // اى حد لازم يكون مسجل دخول
        [HttpGet("CheckMyRole")]
        public IActionResult CheckAccess()
        {
            if (User.IsInRole("Admin"))
            {
                return Ok(new { message = "Welcome Admin" });
            }
            if (User.IsInRole("Customer"))
            {
                return BadRequest(new { message = "Admins Only !" });
            }
            return Unauthorized(new { message = "SignUp First !!" });
        }
        #endregion
    }
}
