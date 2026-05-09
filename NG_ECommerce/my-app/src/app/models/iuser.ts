export interface IUser {
  id?:    number;   // 👈 optional because new users don't have id yet
  
  firstName:   string;
  lastName:   string;
  email:  string;
  password:   string;
  role:   string ; 
}
