import { Component } from '@angular/core';
import { AppFloatingConfigurator } from '../../../../layout/component/app.floatingconfigurator';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth-unauthorized',
  imports: [AppFloatingConfigurator, RouterModule, ButtonModule],
  templateUrl: './auth-unauthorized.html',
  styleUrl: './auth-unauthorized.css',
})
export class AuthUnauthorized {}
