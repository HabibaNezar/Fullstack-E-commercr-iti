// users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from "../../services/user.service";
import { IUser } from './../../models/iuser';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: IUser[] = [];

  // 👇 the form object — starts empty
  formUser: IUser = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'Customer',
    password: '',
    wishlist: [],
    paymentDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: ''
    }
  };

  // 👇 tracks if we're editing or creating
  isEditing = false;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.loadUsers();
  }

  // READ
  loadUsers() {
    this.usersService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  // CREATE
  addUser() {
    this.usersService.addUser(this.formUser).subscribe(newUser => {
      this.users.push(newUser);   // 👈 add to local array instantly
      this.resetForm();
    });
  }

  // prepare form for EDIT
  editUser(user: IUser) {
    this.isEditing = true;
    this.formUser = { ...user }; // 👈 copy user into form (don't mutate original)
  }

  // UPDATE
  updateUser() {
    this.usersService.updateUser(this.formUser).subscribe(updated => {
      const index = this.users.findIndex(u => u.id === updated.id);
      this.users[index] = updated; // 👈 replace old with updated
      this.resetForm();
    });
  }

  // DELETE
  deleteUser(id: number) {
    this.usersService.deleteUser(String(id)).subscribe(() => {
      this.users = this.users.filter(u => u.id !== id);
    });
  }

  // submit handler — decides create or update
  onSubmit() {
    if (this.isEditing) {
      this.updateUser();
    } else {
      this.addUser();
    }
  }

  resetForm() {
    this.formUser = {
      firstName: '',
      lastName: '',
      email: '',
      role: 'Customer',
      password: '',
      wishlist: [],
      paymentDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
      }
    };
    this.isEditing = false;
  }
}