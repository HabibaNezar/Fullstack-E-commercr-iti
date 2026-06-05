# E-Commerce Full-Stack Application

A comprehensive full-stack E-commerce platform built with **Angular** and **ASP.NET Core Web API**. This project features a robust administrative dashboard, seller management, and a seamless shopping experience.

---

## 🚀 Technologies Used

### Frontend
- **Framework:** Angular 19+
- **Styling:** Bootstrap 5, CSS3
- **State Management:** RxJS
- **Testing:** Vitest
- **Tooling:** TypeScript, Prettier

### Backend
- **Framework:** .NET 8.0 (ASP.NET Core Web API)
- **Database:** SQL Server
- **ORM:** Entity Framework Core
- **Authentication:** ASP.NET Core Identity, JWT Bearer Tokens
- **Email Service:** MailKit
- **API Documentation:** Swagger (Swashbuckle)

---

## 📂 Project Structure

```
Angular_Proj/
├── Backend/                # ASP.NET Core Web API Solution
│   ├── LoginAndRegister/   # Main API Project
│   │   ├── Controllers/    # API Endpoints
│   │   ├── Models/         # Database Entities
│   │   ├── DTO/            # Data Transfer Objects
│   │   ├── Services/       # Business Logic & External Services
│   │   └── Data/           # DB Context & Migrations
├── Frontend/               # Angular Application
│   └── my-app/
│       ├── src/app/
│       │   ├── admin/      # Admin Dashboard Features
│       │   ├── seller/     # Seller Dashboard Features
│       │   ├── features/   # Common Features (Auth, Cart, Products)
│       │   ├── core/       # Guards, Interceptors, Core Services
│       │   └── shared/     # Reusable Components & Pipes
```

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure Login and Registration using ASP.NET Core Identity.
- Role-based access control (Admin, Seller, Customer).
- JWT-based authentication for secure API communication.

### 🛠 Administrative Dashboard
- **Banner Management:** Control homepage promotional banners.
- **Category Management:** Create and organize product categories.
- **User Management:** Monitor and manage platform users.
- **Order Tracking:** Oversee all platform-wide orders.

### 🏪 Seller Portal
- **Product Management:** Add, update, and track inventory.
- **Earnings Tracking:** Monitor sales performance and earnings.
- **Order Management:** Handle specific orders related to the seller.

### 🛒 Shopping Experience
- **Product Catalog:** Filter and search products by categories and price.
- **Shopping Cart:** Add/remove items and manage quantities.
- **Checkout Process:** Seamless transition from cart to order placement.

---

## 🛠 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### Backend Setup
1. Navigate to the `Backend/LoginAndRegister` directory.
2. Update the connection string in `appsettings.json`.
3. Run migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the API:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the `Frontend/my-app` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Access the application at `http://localhost:4200`.

---

## 📄 License
This project is developed as part of the ITI Angular Lab.
