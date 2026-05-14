using System.ComponentModel.DataAnnotations.Schema;

namespace LoginAndRegister.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public string OrderStatus { get; set; } = "Pending"; // Pending, Shipped, Delivered, Cancelled
        [Column(TypeName ="decimal(18,2)")]
        public decimal TotalPrice { get; set; }
        public string ShppingAddress { get; set; }
        public string AppUserId { get; set; }
        // العلاقة مع المشترى
        [ForeignKey("AppUserId")]
        public virtual AppUser User { get; set; }
        // قائمة المنتجات اللى جوا الاوردر
        public virtual ICollection<OrderItem> OrderItem { get; set; } = new HashSet<OrderItem>();
    }
}
