import { Component } from '@angular/core';
import { TwoFactorAuthForm } from './components/form/form';

@Component({
  selector: 'app-two-factor-auth',
  imports: [TwoFactorAuthForm],
  templateUrl: './two-factor-auth.html',
  styleUrl: './two-factor-auth.css',
})
export class TwoFactorAuth {}
