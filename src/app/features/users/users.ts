import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TableModule, Table } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { UsersService } from './services/users.service';
import { SignUpService } from '../../core/auth/pages/sign-up/services/sign-up.service';
import { User } from './models/user.interface';
import { ToastService } from '../../shared/services/toast.service';
import { RegisterRequest } from '../../core/auth/pages/sign-up/models/sign-up.interface';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    TableModule,
    ToolbarModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    RippleModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  userDialog: boolean = false;
  users = signal<User[]>([]);
  newUser: RegisterRequest = {
    email: '',
    name: '',
    lastname: '',
    password: '',
  } as RegisterRequest;
  password2: string = '';
  submitted: boolean = false;
  loading: boolean = false;

  // Errores de validación
  errors = {
    email: '',
    name: '',
    lastname: '',
    password1: '',
    password2: '',
  };

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols!: Column[];

  constructor(
    private usersService: UsersService,
    private signUpService: SignUpService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.setupColumns();
  }

  setupColumns() {
    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'email', header: 'Email' },
      { field: 'name', header: 'Nombre' },
      { field: 'lastname', header: 'Apellido' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showError(
          'Error al cargar usuarios',
          error.error?.message || 'No se pudieron cargar los usuarios'
        );
      },
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.newUser = {
      email: '',
      name: '',
      lastname: '',
      password: '',
    };
    this.password2 = '';
    this.submitted = false;
    this.clearErrors();
    this.userDialog = true;
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
    this.clearErrors();
  }

  saveUser() {
    this.submitted = true;
    this.clearErrors();

    // Validaciones
    let hasErrors = false;

    if (!this.newUser.email || this.newUser.email.trim() === '') {
      this.errors.email = 'El correo electrónico es requerido';
      hasErrors = true;
    } else if (!this.isValidEmail(this.newUser.email)) {
      this.errors.email = 'Ingrese un correo electrónico válido';
      hasErrors = true;
    }

    if (!this.newUser.name || this.newUser.name.trim() === '') {
      this.errors.name = 'El nombre es requerido';
      hasErrors = true;
    }

    if (!this.newUser.lastname || this.newUser.lastname.trim() === '') {
      this.errors.lastname = 'El apellido es requerido';
      hasErrors = true;
    }

    if (!this.newUser.password || this.newUser.password.trim() === '') {
      this.errors.password1 = 'La contraseña es requerida';
      hasErrors = true;
    } else if (this.newUser.password.length < 6) {
      this.errors.password1 = 'La contraseña debe tener al menos 6 caracteres';
      hasErrors = true;
    }

    if (!this.password2 || this.password2.trim() === '') {
      this.errors.password2 = 'Debe confirmar la contraseña';
      hasErrors = true;
    } else if (this.newUser.password !== this.password2) {
      this.errors.password2 = 'Las contraseñas no coinciden';
      hasErrors = true;
    }

    if (hasErrors) {
      this.toastService.showWarn(
        'Campos incompletos',
        'Por favor complete todos los campos correctamente'
      );
      return;
    }

    this.loading = true;

    this.signUpService
      .register({
        email: this.newUser.email.trim(),
        name: this.newUser.name.trim(),
        lastname: this.newUser.lastname.trim(),
        password: this.newUser.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.userDialog = false;
          this.newUser = {
            email: '',
            name: '',
            lastname: '',
            password: '',
          };
          this.password2 = '';
          this.submitted = false;
          // Recargar la lista de usuarios
          this.loadUsers();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private clearErrors(): void {
    this.errors = {
      email: '',
      name: '',
      lastname: '',
      password1: '',
      password2: '',
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Limpiar error cuando el usuario empieza a escribir
  onFieldChange(field: keyof typeof this.errors): void {
    if (this.errors[field]) {
      this.errors[field] = '';
    }

    // Validar que las contraseñas coincidan en tiempo real
    if (field === 'password1' || field === 'password2') {
      if (this.newUser.password && this.password2 && this.newUser.password !== this.password2) {
        this.errors.password2 = 'Las contraseñas no coinciden';
      } else if (this.newUser.password && this.password2 && this.newUser.password === this.password2) {
        this.errors.password2 = '';
      }
    }
  }
}
