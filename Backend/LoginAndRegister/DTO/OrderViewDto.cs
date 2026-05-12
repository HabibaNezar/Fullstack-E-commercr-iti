namespace LoginAndRegister.DTO
{
    public class OrderViewDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalPrice { get; set; }
        public string ShippingAddress { get; set; }
        public List<OrderItemViewDto> Items { get; set; } 
    }
    public class OrderItemViewDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}
