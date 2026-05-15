using System.ComponentModel.DataAnnotations;

namespace LoginAndRegister.Models
{
    public class Review
    {
        public int Id { get; set; }
        [Range(1,5)]
        public int Rating { get; set; }
        public string Comment  { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // Relation with Product
        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        // Relation With User
        public string AppUserId { get; set; }
        public  AppUser AppUser { get; set; }
    }
}
