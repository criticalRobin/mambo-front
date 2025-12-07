import { Component } from '@angular/core';
import { SignUpForm } from './components/form/form';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, SignUpForm],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {}
