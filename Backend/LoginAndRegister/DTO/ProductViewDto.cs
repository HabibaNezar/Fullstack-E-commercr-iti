namespace LoginAndRegister.DTO
{
    public class ProductViewDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int StockQuantity { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public string CategoryName { get; set; }

        // Review 
        public double AverageRating { get; set; } // متوسط النجوم
        public int ReviewsCount { get; set; }    // عدد المراجعات
        public List<ReviewReturnDto> reviews { get; set; } // قائمة المراجعات 
    }
}
