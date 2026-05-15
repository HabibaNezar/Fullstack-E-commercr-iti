using System.ComponentModel.DataAnnotations;

namespace LoginAndRegister.DTO
{
    public class ReviewDto
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        [Range(1,5 , ErrorMessage ="Rate From 1 To 5")]
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}
