
using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using LoginAndRegister.Services;

namespace LoginAndRegister
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            //builder.Services.AddSwaggerGen();

            // Add DbContext
            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add Identity
            //builder.Services.AddIdentity<AppUser, IdentityRole>()
            //.AddEntityFrameworkStores<AppDbContext>()
            //.AddDefaultTokenProviders();

            #region Email Confirmation
            // 1.  ›⁄Ì· ‰Ÿ«„ «· Êﬂ‰“ ›Ì «·‹ Identity
            builder.Services.AddIdentity<AppUser, IdentityRole>(options => {
                // 1.  ›⁄Ì· ÷—Ê—…  √ﬂÌœ «·≈Ì„Ì· ··œŒÊ·
                options.SignIn.RequireConfirmedEmail = true;

                // 2. «·”ÿ— œÂ ÂÊ «·Õ· ·„‰⁄  ﬂ—«— «·≈Ì„Ì· ›Ì «·œ« «»Ì“
                options.User.RequireUniqueEmail = true;

                // 3.  ≈⁄œ«œ«  «·»«”Ê—œ 
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false; // „‘ ÂÌÃ»—ﬂ ⁄·Ï —„Ê“ ’⁄»…
                options.Password.RequireUppercase = false; // „‘ ÂÌÃ»—ﬂ ⁄·Ï Õ—Ê› ﬂ»Ì—…
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders(); 

            builder.Services.AddTransient<IEmailSender, EmailSender>();

            #endregion

            #region JWT Authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })  
               .AddJwtBearer(options =>
            {
               options.TokenValidationParameters = new TokenValidationParameters
            {
                 ValidateIssuer = true,
                 ValidateAudience = true,
                 ValidateLifetime = true,
                 ValidateIssuerSigningKey = true,

         ValidIssuer = builder.Configuration["Jwt:Issuer"],
         ValidAudience = builder.Configuration["Jwt:Audience"],

         IssuerSigningKey = new SymmetricSecurityKey(
             Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
 });
            #endregion

            #region Swagar 
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "ECommerce API",
                    Version = "v1"
                });

                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,

                    Description = "Enter JWT Token like this: Bearer your_token"
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
            });

            #endregion

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();

            app.MapControllers();

            #region Identity Seeding (Roles & Admin User)
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>(); // ÷Ì›‰« «·‹ UserManager
                // 1. ≈‰‘«¡ «·√œÊ«— ·Ê „‘ „ÊÃÊœ…
                string[] roleNames = { "Admin", "Customer", "Seller" };
                foreach (var roleName in roleNames)
                {
                    if (!await roleManager.RoleExistsAsync(roleName))
                    {
                        await roleManager.CreateAsync(new IdentityRole(roleName));
                    }
                }
                // 2. ≈‰‘«¡ ÌÊ“— √œ„‰ «› —«÷Ì 
                var adminEmail = "admin@ecommerce.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    var newAdmin = new AppUser
                    {
                        UserName = "SuperAdmin",
                        Email = adminEmail,
                        EmailConfirmed = true,
                        Address = "Main Admin Office",
                        City = "Cairo", 
                        PhoneNumber = "0123456789"
                    };
                    // »‰ﬂ—Ì  «·ÌÊ“— Ê»‰œÌ·Â »«”Ê—œ ﬁÊÌ
                    var createAdminResult = await userManager.CreateAsync(newAdmin, "Admin@123");
                    if (createAdminResult.Succeeded)
                    {
                        // »‰—»ÿ «·ÌÊ“— œÂ »œÊ— «·‹ Admin
                        await userManager.AddToRoleAsync(newAdmin, "Admin");
                    }
                }
            }
            #endregion

            #region Adding Dummy Data if there is no acual data
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>(); 
                try
                {
                    await StoreContextSeed.SeedAsync(context, userManager);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message); // ⁄‘«‰ ·Ê Õ’· «Ì—Ê— ÌŸÂ— Â‰«
                }
            }
            #endregion

            app.Run();
        }
    }
}
