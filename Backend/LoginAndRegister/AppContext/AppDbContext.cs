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
        public DbSet<Wishlist> Wishlist { get; set; }

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

            // الجزء دا مهم عشان ال soft delete
            // عشان بشكل تلقائى يعرض المنتجات اللى موجود بس 
            // فلتر تلقائي للمنتجات
            builder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
            // فلتر تلقائي لليوزرز
            builder.Entity<AppUser>().HasQueryFilter(u => !u.IsDeleted);

            builder.Entity<CartItems>()
           .HasOne(c => c.User)
           .WithMany()
           .HasForeignKey(c => c.AppUserId)
           .IsRequired(false); // كدة بقت اختيارية تماماً

            // 4. علاقة اليوزر بالأوردر 
            builder.Entity<Order>()
                   .HasOne(o => o.User)
                   .WithMany()
                   .HasForeignKey(o => o.AppUserId)
                   .IsRequired(false);

            // 5. علاقة اليوزر بالـ Review 
            builder.Entity<Review>()
                   .HasOne(r => r.AppUser)
                   .WithMany()
                   .HasForeignKey(r => r.AppUserId)
                   .IsRequired(false);
        }
    }
}
