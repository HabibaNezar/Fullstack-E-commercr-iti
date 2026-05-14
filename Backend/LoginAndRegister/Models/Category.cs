using System.ComponentModel.DataAnnotations;

namespace LoginAndRegister.Models
{
    public class Category
    {
        public int Id { get; set; }
        [Required , StringLength(100)]
        public string Name { get; set; }
        // Relation With Product
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
