import { Component } from '@angular/core';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [AppFloatingConfigurator, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {}
