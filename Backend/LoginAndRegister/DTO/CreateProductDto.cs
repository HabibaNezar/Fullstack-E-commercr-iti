using System.ComponentModel.DataAnnotations;

namespace LoginAndRegister.DTO
{
    public class CreateProductDto
    {
        [Required(ErrorMessage ="Name Is Required !")]
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        [Range(0.1, 100000)]
        public decimal Price { get; set; }
        [Required]
        public int StockQuantity { get; set; }
        [Required]
        // الصورة بتوصل لل api على هيئة بيانات
        public IFormFile Image { get; set; }
        [Required]
        public int CategoryId { get; set; }

    }
}
