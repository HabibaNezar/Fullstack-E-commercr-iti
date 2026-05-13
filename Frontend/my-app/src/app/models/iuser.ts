export interface IUser {
  id?:    any;   // 👈 optional because new users don't have id yet
  
  firstName:   string;
  lastName:   string;
  email:  string;
  password:   string;
  role:   'Customer' | 'Seller' | 'Admin' | string; 
  phone?: string;
  address?: string;
  paymentDetails?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
  };
  wishlist?: number[]; // Array of product IDs
}
