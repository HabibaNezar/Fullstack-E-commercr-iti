using Microsoft.AspNetCore.Identity;

namespace LoginAndRegister.Models
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string? ProfilePicture { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Relation With CartItem
        public virtual ICollection<CartItems> CartItems{ get; set; } = new HashSet<CartItems>();   
    }
}
