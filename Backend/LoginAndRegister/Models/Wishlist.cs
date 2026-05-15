namespace LoginAndRegister.Models
{
    public class Wishlist
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string AppUserId { get; set; }
        //Relation With Product
        public Product Product { get; set; }
        //Relation With User
        public AppUser AppUser { get; set; }
    }
}
