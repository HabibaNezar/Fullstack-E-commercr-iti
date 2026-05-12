using System.ComponentModel.DataAnnotations.Schema;

namespace LoginAndRegister.Models
{
    public class CartItems
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        // Relation With Product
        public virtual Product Product { get; set; }

        // Relation With User
        [ForeignKey("AppUserId")]
        public virtual AppUser User { get; set; }
    }
}
