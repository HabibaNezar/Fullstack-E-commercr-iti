using LoginAndRegister.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LoginAndRegister.AppContext
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CartItems> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> orderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Wishlist> Wishlist { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. البائع
            builder.Entity<Product>()
                   .HasOne(p => p.Seller)
                   .WithMany()
                   .HasForeignKey(p => p.SellerId)
                   .OnDelete(DeleteBehavior.Restrict);

            // 2. الـ Soft Delete
            builder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
            builder.Entity<AppUser>().HasQueryFilter(u => !u.IsDeleted);

            // 3. السلة والمستخدم (حل الـ Shadow State والـ Filter)
            builder.Entity<CartItems>()
                   .HasOne(c => c.AppUser)
                   .WithMany(u => u.CartItems)
                   .HasForeignKey(c => c.AppUserId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Cascade);

            // 4. السلة والمنتج
            builder.Entity<CartItems>()
                   .HasOne(c => c.Product)
                   .WithMany()
                   .HasForeignKey(c => c.ProductId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Cascade);

            // 5. الأوردر
            builder.Entity<Order>()
                   .HasOne(o => o.User)
                   .WithMany()
                   .HasForeignKey(o => o.AppUserId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);

            // 6. الـ Review
            builder.Entity<Review>()
                   .HasOne(r => r.AppUser)
                   .WithMany()
                   .HasForeignKey(r => r.AppUserId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}