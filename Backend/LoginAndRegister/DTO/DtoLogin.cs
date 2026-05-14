using System.ComponentModel.DataAnnotations;

namespace LoginAndRegister.DTO
{
    public class DtoLogin
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        //public string Name { get; set; }


    }
}
