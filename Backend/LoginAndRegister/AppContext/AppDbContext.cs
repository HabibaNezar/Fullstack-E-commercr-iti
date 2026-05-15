using LoginAndRegister.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace LoginAndRegister.AppContext
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        // Connection With DB
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options)
        {
        }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CartItems> CartItems { get; set; } 
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> orderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // هنا انا بقوله انا عندى جدول منتجات 
            // الجدول دا ليه سيلر واحد بس وفيه كذا مستخدم ممكن يشترى منه
            // فلو مسحنا يوزر وفى نفس الوقت اليوزر دا كان سيلر متمسحش كل المنتجات بتاعته
            base.OnModelCreating(builder);
            builder.Entity<Product>()
                   .HasOne(p => p.Seller)
                   .WithMany() 
                   .HasForeignKey(p => p.SellerId)
                   // فى السطر دا بقوله متعملش مسح تلقائى
                   .OnDelete(DeleteBehavior.Restrict); 
        }
    }
}
