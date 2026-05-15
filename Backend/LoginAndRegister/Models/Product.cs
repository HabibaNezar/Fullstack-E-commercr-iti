using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoginAndRegister.Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required , StringLength(150)]
        public string Name { get; set; }
        public string Description { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // السعر الاصلى
        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; } // السعر بعد الخصم
        public int StockQuantity { get; set; }
        public string? ImagePath { get; set; }
        public int CategoryId { get; set; }
        public string SellerId { get; set; }
        public bool IsDeleted { get; set; } = false;
        // هنا بقوله لو فى كود خصم استخدمة لو مفيش ابعتلى السعر الحقيقى
        public decimal ActualPrice => DiscountPrice.HasValue ? DiscountPrice.Value : Price;

        // Relation With Category
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }
        [ForeignKey("SellerId")]
        public virtual AppUser Seller {  get; set; }
        // Relation With Review 
        public ICollection<Review> Reviews { get; set; } = new HashSet<Review>();
    }
}
