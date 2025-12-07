import { Component } from '@angular/core';
import { SignUpForm } from './components/form/form';

@Component({
  selector: 'app-sign-up',
  imports: [SignUpForm],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {}
