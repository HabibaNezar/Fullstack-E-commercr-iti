# ShopHub - E-Commerce Frontend

An Angular 21 e-commerce frontend application integrated with a .NET Core API backend. This application features role-based access control, product management, shopping cart functionality, order tracking, and admin/seller panels.

## Project Overview

ShopHub is a full-featured e-commerce platform with the following key features:

- **User Management**: Registration, login, profile management
- **Product Browsing**: Search, filter by category and price, wishlist functionality
- **Shopping Cart**: Add to cart, quantity management, checkout
- **Order Management**: Order placement, tracking, order history
- **Admin Panel**: User management, product/category management, order management, dashboard analytics
- **Seller Panel**: Product management, order tracking, sales analytics, profile management
- **Role-Based Access Control**: Public, Customer, Seller, and Admin roles with appropriate permissions

## Tech Stack

- **Frontend**: Angular 21 with standalone components and signals
- **Backend**: .NET Core API (JWT Bearer authentication)
- **Styling**: CSS with custom components
- **HTTP**: Angular HttpClient with interceptors for JWT token attachment
- **State Management**: Angular signals for reactive state

## Project Structure

```
src/app/
├── admin/                    # Admin panel components and services
│   ├── admin-dashboard/      # Admin dashboard with analytics
│   ├── admin-users/         # User management
│   ├── admin-products/      # Product management
│   ├── admin-categories/    # Category management
│   ├── admin-orders/        # Order management
│   ├── admin-promos/        # Promo code management (local only)
│   ├── admin-banners/       # Site banner management (local only)
│   └── services/            # Admin-specific services
├── Seller/                  # Seller panel components
│   ├── seller-dashboard/    # Seller dashboard
│   ├── seller-products/     # Product management
│   ├── seller-orders/       # Order tracking
│   ├── seller-earnings/     # Earnings analytics
│   └── seller-profile/      # Profile management
├── core/                    # Core services and guards
│   ├── services/            # Auth, product, category, cart, order, seller services
│   ├── guards/              # Auth, admin, seller route guards
│   ├── interceptors/        # JWT token interceptor
│   └── models/              # TypeScript interfaces
├── features/                # Feature components
│   ├── auth/                # Login and register
│   ├── products/            # Product browsing and management
│   ├── cart/                # Shopping cart
│   ├── orders/              # Checkout and order tracking
│   └── profile/             # User profile
├── shared/                  # Shared components and services
│   ├── components/          # Navbar, footer, etc.
│   └── services/            # Wishlist, reviews, user services
└── app.routes.ts            # Main application routing
```

## Role-Based Access Control

The application implements strict role-based access control:

| Role | Access Level | Features |
|------|-------------|----------|
| **Public** | No authentication | View products, browse categories |
| **Customer** | isLoggedIn | Add to cart, checkout, view orders, wishlist, profile |
| **Seller** | isSeller | Customer features + manage products, view seller orders, seller dashboard, seller profile |
| **Admin** | isAdmin | Customer features + manage users, products, categories, orders, admin dashboard, promos, banners |

### Route Guards

- **authGuard**: Protects routes requiring login (cart, checkout, profile, my-orders)
- **adminGuard**: Protects admin routes (requires Admin role)
- **sellerGuard**: Protects seller routes (requires Seller role)

## API Integration

### Authentication

- **Login**: POST `/api/Auth/Login` (JSON body)
- **Register**: POST `/api/Auth/Register` (JSON body)
- JWT token stored in `localStorage` and attached via interceptor

### Products

- **Get All**: GET `/api/Product` (with query params for filtering)
- **Get By ID**: GET `/api/Product/{id}`
- **Create**: POST `/api/Product` (multipart/form-data with image)
- **Update**: PUT `/api/Product/{id}` (multipart/form-data with image)
- **Delete**: DELETE `/api/Product/{id}`

### Categories

- **Get All**: GET `/api/Category`
- **Create**: POST `/api/Category` (JSON body)
- **Update**: PUT `/api/Category/{id}` (JSON body)
- **Delete**: DELETE `/api/Category/{id}`

### Cart

- **Add to Cart**: POST `/api/Cart/Add_To_Cart` (query params: productId, quantity)
- **Get Cart**: GET `/api/Cart/Get_Cart`
- Note: Cart remove/update handled locally due to API limitations

### Orders

- **Checkout**: POST `/api/Order/Checkout` (query param: shippingAddress, JSON body)
- **My Orders**: GET `/api/Order/My_Orders`
- **All Orders (Admin)**: GET `/api/Admin/AllOrders`
- **Update Status (Admin)**: PUT `/api/Admin/UpdateOrderStatus` (raw JSON string body)

### Seller

- **Sales Status**: GET `/api/Seller/Sales_Status`
- **Low Stock Alert**: GET `/api/Seller/LowStockAlert`
- **My Orders**: GET `/api/Seller/MyOrders`
- **Top Selling Products**: GET `/api/Seller/TopSellingProducts`
- **Update Profile**: PUT `/api/Seller/UpdateProfile` (JSON body)

### Admin

- **All Users**: GET `/api/Admin/AllUsers`
- **All Orders**: GET `/api/Admin/AllOrders`
- **All States**: GET `/api/Admin/AllStates`

### Local-Only Features

The following features are implemented locally without backend endpoints:

- **Wishlist**: Stored in `localStorage` within user object
- **Reviews**: Mock data only
- **Promo Codes**: Managed via `AdminCmsService` (local storage)
- **Site Banners**: Managed via `AdminCmsService` (local storage)
- **User Restrictions/Soft Delete**: Managed via `AdminLocalPolicyService` (local storage)

## Development Server

To start a local development server, run:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. API requests are proxied to the .NET backend via `proxy.conf.json`.

## Environment Configuration

The application uses environment configuration in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
  apiServerOrigin: 'https://localhost:7237',
};
```

- `apiUrl`: Base URL for API calls (proxied during development)
- `apiServerOrigin`: Origin for resolving relative image paths from API responses

## Building

To build the project for production:

```bash
ng build --configuration production
```

Build artifacts are stored in the `dist/` directory.

## Testing

Run unit tests:

```bash
ng test
```

Run end-to-end tests:

```bash
ng e2e
```

## Key Integration Notes

### Image Handling

- Product list uses `imagePath` (filename only) requiring base URL prefix
- Product detail uses full `imageUrl`
- Images are uploaded using `multipart/form-data` for create/update operations

### JWT Token Handling

- Token stored in `localStorage` after successful login
- Auth interceptor automatically attaches token to all protected API calls
- Login and registration endpoints are excluded from token attachment

### Cart Limitations

- The API's `Add_To_Cart` endpoint adds a new row on every call
- Frontend mitigates this by calling API once per product and managing quantity changes locally
- Cart removal and quantity updates are handled locally due to lack of backend endpoints

### Admin Order Status Update

- Requires raw JSON string body, not an object
- Example: `"pending"` instead of `{ "status": "pending" }`

### Phone Number Validation

- Egyptian phone numbers only: `^(010|011|012|015)\d{8}$`

## Recent Fixes Applied

1. **Route Guards**: Added `authGuard` to `/cart` and `/checkout` routes
2. **Product Management UI**: Edit/delete buttons now visible to both Seller and Admin roles
3. **Navbar Navigation**: Added Seller dashboard links for users with Seller role
4. **Seller Profile**: Created missing `/seller/profile` route and component
5. **Admin Dashboard**: Fixed to use Admin endpoints (`/Admin/AllUsers`, `/Admin/AllOrders`, `/Admin/AllStates`) instead of Seller endpoints

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Documentation](https://angular.dev)
- [.NET Core API Reference](./API_REFERENCE.md)

## License

This project is part of a full-stack e-commerce solution.
