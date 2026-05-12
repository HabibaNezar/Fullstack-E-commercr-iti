namespace LoginAndRegister.DTO
{
    public class ProductFilterDto
    {
        public string? Search {  get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Sort { get; set; }
    }
}
