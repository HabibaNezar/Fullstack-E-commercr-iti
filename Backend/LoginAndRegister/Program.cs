using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using LoginAndRegister.Services;
using Stripe;

namespace LoginAndRegister
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // Add DbContext
            builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Stripe
            builder.Services.AddScoped<IPaymentService, PaymentService>();

            #region Email Confirmation & Identity Configuration
            builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.SignIn.RequireConfirmedEmail = true;
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
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

            #region Swagger Configuration
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

            #region Stripe Configuration
            // قراءة الإعدادات من appsettings
            builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
            // تفعيل السيكريت كي في المكتبة
            StripeConfiguration.ApiKey = builder.Configuration.GetSection("Stripe")["SecretKey"];
            #endregion

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles(); // يفضل وضعها قبل Authentication
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            #region Identity & Dummy Data Seeding
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>();
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>();
                try
                {
                    // 1. إنشاء الأدوار في قاعدة البيانات
                    string[] roleNames = { "Admin", "Customer", "Seller" };
                    foreach (var roleName in roleNames)
                    {
                        if (!await roleManager.RoleExistsAsync(roleName))
                        {
                            await roleManager.CreateAsync(new IdentityRole(roleName));
                        }
                    }
                    // 2. إنشاء حساب الأدمن
                    var adminEmail = "admin@test.com";
                    var adminUser = await userManager.FindByEmailAsync(adminEmail);
                    if (adminUser == null)
                    {
                        var newAdmin = new AppUser
                        {
                            UserName = "EmanGenedy",
                            Email = adminEmail,
                            EmailConfirmed = true,
                            Address = "Alex",
                            City = "Alex",
                            PhoneNumber = "01030862334",
                            FirstName = "Eman",
                            LastName = "Genedy",
                            DisplayName = "Eman Genedy",
                            CreatedAt = DateTime.Now
                        };
                        var createAdminResult = await userManager.CreateAsync(newAdmin, "Admin@123");
                        if (createAdminResult.Succeeded)
                        {
                            await userManager.AddToRoleAsync(newAdmin, "Admin");
                        }
                    }
                    // 3. إنشاء حساب البائع (Seller)
                    var sellerEmail = "seller@test.com";
                    var sellerUser = await userManager.FindByEmailAsync(sellerEmail);
                    if (sellerUser == null)
                    {
                        var newSeller = new AppUser
                        {
                            UserName = "EsraaShiref",
                            Email = sellerEmail,
                            EmailConfirmed = true,
                            Address = "Cairo",
                            City = "Cairo",
                            PhoneNumber = "01029496150",
                            FirstName = "Esraa",
                            LastName = "Shiref",
                            DisplayName = "Esraa Shiref",
                            CreatedAt = DateTime.Now
                        };
                        var createSellerResult = await userManager.CreateAsync(newSeller, "Seller@123");
                        if (createSellerResult.Succeeded)
                        {
                            await userManager.AddToRoleAsync(newSeller, "Seller");
                        }
                    }
                    // 4. إنشاء حساب العميل (Customer)
                    var customerEmail = "customer@test.com";
                    var customerUser = await userManager.FindByEmailAsync(customerEmail);
                    if (customerUser == null)
                    {
                        var newCustomer = new AppUser
                        {
                            UserName = "HabibaNezar",
                            Email = customerEmail,
                            EmailConfirmed = true,
                            Address = "Tanta",
                            City = "Tanta",
                            PhoneNumber = "01271601623",
                            FirstName = "Habiba",
                            LastName = "Nezar",
                            DisplayName = "Habiba Nezar",
                            CreatedAt = DateTime.Now
                        };

                        var createCustomerResult = await userManager.CreateAsync(newCustomer, "Customer@123");
                        if (createCustomerResult.Succeeded)
                        {
                            await userManager.AddToRoleAsync(newCustomer, "Customer");
                        }
                    }

                    // 5. استدعاء البيانات الوهمية للمتجر (Dummy Data)
                    await StoreContextSeed.SeedAsync(context, userManager);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Seeding Error: {ex.Message}");
                }
            }
            #endregion

            app.Run();
        }
    }
}