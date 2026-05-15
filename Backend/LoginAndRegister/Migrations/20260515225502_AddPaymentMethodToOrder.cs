using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoginAndRegister.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMethodToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wishlist_AspNetUsers_AppUserId",
                table: "Wishlist");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishlist_Products_ProductId",
                table: "Wishlist");

            migrationBuilder.AlterColumn<int>(
                name: "ProductId",
                table: "Wishlist",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "AppUserId",
                table: "Wishlist",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlist_AspNetUsers_AppUserId",
                table: "Wishlist",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlist_Products_ProductId",
                table: "Wishlist",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wishlist_AspNetUsers_AppUserId",
                table: "Wishlist");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishlist_Products_ProductId",
                table: "Wishlist");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Orders");

            migrationBuilder.AlterColumn<int>(
                name: "ProductId",
                table: "Wishlist",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AppUserId",
                table: "Wishlist",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlist_AspNetUsers_AppUserId",
                table: "Wishlist",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlist_Products_ProductId",
                table: "Wishlist",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
