using LoginAndRegister.AppContext;
using LoginAndRegister.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class StoreContextSeed
{
    public static async Task SeedAsync(AppDbContext context, UserManager<AppUser> userManager)
    {
        try
        {
            // 1. هاتي أي يوزر موجود في السيستم عنده صلاحية Seller
            var allSellers = await userManager.GetUsersInRoleAsync("Seller");
            var seller = allSellers.FirstOrDefault();

            // لو ملقاش بائع، هاتي أول يوزر وخلاص عشان الكود ميفصلش
            if (seller == null)
            {
                seller = await context.Users.FirstOrDefaultAsync();
            }

            // لو لسه مفيش يوزر خالص (الداتابيز فاضية تماماً)
            if (seller == null) return;

            // 2. إضافة الأقسام (لو مش موجودة)
            if (!await context.Categories.AnyAsync())
            {
                context.Categories.AddRange(
                    new Category { Name = "Electronics" },
                    new Category { Name = "Fashion" }
                );
                await context.SaveChangesAsync();
            }

            // 3. إضافة المنتجات
            if (!await context.Products.AnyAsync())
            {
                var category = await context.Categories.FirstAsync();

                context.Products.AddRange(
         new Product { Name = "iPhone 15 Pro", Price = 55000, StockQuantity = 10, CategoryId = category.Id, SellerId = seller.Id, Description = "Latest Apple Phone", ImagePath = "https://m.media-amazon.com/images/I/81Sig6biNGL._AC_SL1500_.jpg" },
         new Product { Name = "Nike Air Max", Price = 4500, StockQuantity = 15, CategoryId = category.Id, SellerId = seller.Id, Description = "Comfortable Running Shoes", ImagePath = "https://m.media-amazon.com/images/I/51f98I5IdML._AC_UX695_.jpg" },
         new Product { Name = "Samsung Galaxy S23", Price = 42000, StockQuantity = 8, CategoryId = category.Id, SellerId = seller.Id, Description = "High-end Android Smartphone", ImagePath = "https://m.media-amazon.com/images/I/71Oro6K8BFL._AC_SL1500_.jpg" },
         new Product { Name = "MacBook Air M2", Price = 68000, StockQuantity = 5, CategoryId = category.Id, SellerId = seller.Id, Description = "Slim and Powerful Laptop", ImagePath = "https://m.media-amazon.com/images/I/71ItM9koo9L._AC_SL1500_.jpg" },
         new Product { Name = "Sony Headphones", Price = 12000, StockQuantity = 12, CategoryId = category.Id, SellerId = seller.Id, Description = "Noise Cancelling Headphones", ImagePath = "https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1200_.jpg" }
     );
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seeding Error: {ex.Message}");
        }
    }
}