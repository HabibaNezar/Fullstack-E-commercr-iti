using System.ComponentModel.DataAnnotations.Schema;

namespace LoginAndRegister.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        [Column(TypeName = "decimal(18,2))")]
        public decimal PriceAtPurchase { get; set; } // دا السعر وقت الشراء 
        // الحته دى مهمه عشان احتفظ بالسعر وقت ماليوزر اشترى بالظبط عشان لو مثلا السعر اتغير بعد ما يشترى الارورد بتاعه هو ميتأثرش 
        // Relation with Order 
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
        // Relation with Product 
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }   
    }
}
