import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Inicio',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
      },
      {
        label: 'Documentos',
        items: [
          { label: 'Nuevo Documento', icon: 'pi pi-fw pi-plus', routerLink: ['/documentos/nuevo'] },
          { label: 'Bandeja de Entrada', icon: 'pi pi-fw pi-inbox', routerLink: ['/documentos/bandeja-entrada'] },
          { label: 'Enviados', icon: 'pi pi-fw pi-send', routerLink: ['/documentos/enviados'] }
        ]
      },
      {
        label: 'Mi Cuenta',
        items: [
          { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/perfil'] }
        ]
      },
      {
        label: 'Gestión',
        items: [
          { label: 'Mensajería', icon: 'pi pi-fw pi-envelope', routerLink: ['/uikit/formlayout'] },
          { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/uikit/formlayout'] },
        ],
      },
    ];
  }
}
