using System.ComponentModel.DataAnnotations.Schema;

namespace LoginAndRegister.Models
{
    public class CartItems
    {
        public int Id { get; set; }

        [ForeignKey(nameof(AppUser))]
        public string AppUserId { get; set; }

        [ForeignKey(nameof(Product))]
        public int ProductId { get; set; }

        public int Quantity { get; set; }

        // Relations
        public virtual Product Product { get; set; }
        public virtual AppUser AppUser { get; set; }
    }
}