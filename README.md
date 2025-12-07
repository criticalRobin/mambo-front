# MAMBO - Proyecto Angular

Este proyecto utiliza Angular 20 con arquitectura standalone, PrimeNG v20, Tailwind CSS v4 y PrimeUI Themes.

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Crear un Nuevo Módulo](#crear-un-nuevo-módulo)
- [Componentes de la Plantilla](#componentes-de-la-plantilla)
- [Convenciones de Código](#convenciones-de-código)
- [Scripts Disponibles](#scripts-disponibles)

## 🛠 Tecnologías

- **Angular**: 20.3.0 (Standalone Components)
- **PrimeNG**: 20 (Componentes UI)
- **PrimeUI Themes**: 1.2.1 (Sistema de temas)
- **Tailwind CSS**: 4.1.11 (Utilidades CSS)
- **PrimeIcons**: 7.0.0 (Iconos)
- **RxJS**: 7.8.0 (Programación reactiva)
- **TypeScript**: 5.9.2

## 🏗 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **Feature Modules** y **Core Modules**, utilizando **Standalone Components** de Angular.

### Principios de Arquitectura

1. **Separación por Dominio**: Cada funcionalidad es un módulo independiente
2. **Standalone Components**: Todos los componentes son standalone (sin NgModules)
3. **Lazy Loading**: Los módulos se cargan bajo demanda
4. **Shared Resources**: Componentes, servicios y utilidades compartidas en `shared/`
5. **Layout Centralizado**: Sistema de layout reutilizable en `layout/`

### Estructura de Capas

```
┌─────────────────────────────────────┐
│         Layout Layer                │
│  (AppLayout, Sidebar, Topbar)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Feature Layer               │
│  (Home, Users, etc.)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Core Layer                  │
│  (Auth, Guards, Interceptors)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Shared Layer                │
│  (Components, Services, Utils)      │
└─────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
src/
├── app/
│   ├── core/                    # Módulos core (autenticación, guards, interceptors)
│   │   └── auth/
│   │       ├── components/      # Componentes específicos del módulo auth
│   │       ├── models/          # Interfaces y tipos TypeScript
│   │       ├── pages/           # Páginas del módulo (si tiene múltiples rutas)
│   │       ├── services/        # Servicios específicos del módulo
│   │       ├── auth.ts          # Componente principal del módulo
│   │       ├── auth.html        # Template del componente principal
│   │       ├── auth.css         # Estilos del componente principal
│   │       └── auth.routes.ts   # Rutas del módulo (opcional)
│   │
│   ├── features/                # Módulos de funcionalidades de negocio
│   │   ├── home/
│   │   │   ├── components/      # Componentes específicos del módulo
│   │   │   ├── models/          # Interfaces y tipos
│   │   │   ├── pages/           # Páginas adicionales (si aplica)
│   │   │   ├── services/        # Servicios específicos
│   │   │   ├── home.ts          # Componente principal
│   │   │   ├── home.html
│   │   │   ├── home.css
│   │   │   └── home.routes.ts   # Rutas del módulo (opcional)
│   │   │
│   │   └── users/               # Ejemplo de otro módulo
│   │
│   ├── layout/                  # Componentes de layout de la aplicación
│   │   ├── component/
│   │   │   ├── app.layout.ts    # Layout principal
│   │   │   ├── app.sidebar.ts   # Barra lateral
│   │   │   ├── app.topbar.ts    # Barra superior
│   │   │   ├── app.menu.ts      # Menú de navegación
│   │   │   ├── app.menuitem.ts  # Item del menú
│   │   │   ├── app.footer.ts    # Pie de página
│   │   │   ├── app.configurator.ts      # Configurador de tema
│   │   │   └── app.floatingconfigurator.ts
│   │   └── service/
│   │       └── layout.service.ts # Servicio de gestión del layout
│   │
│   ├── shared/                  # Recursos compartidos (componentes, servicios, utils)
│   │
│   ├── app.ts                   # Componente raíz
│   ├── app.html
│   ├── app.css
│   ├── app.config.ts            # Configuración de la aplicación
│   └── app.routes.ts            # Rutas principales
│
├── assets/                      # Recursos estáticos
│   ├── layout/                  # Estilos del layout
│   ├── demo/                    # Estilos de demo
│   ├── styles.scss              # Estilos globales principales
│   └── tailwind.css             # Configuración de Tailwind
│
└── index.html                   # HTML principal
```

## 🚀 Guía de Desarrollo

### Crear un Nuevo Módulo

Sigue estos pasos para crear un nuevo módulo de funcionalidad:

#### 1. Crear la Estructura de Carpetas

```bash
# Ejemplo: Crear módulo "products"
mkdir -p src/app/features/products/{components,models,pages,services}
```

#### 2. Crear el Componente Principal

**`src/app/features/products/products.ts`**

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  // Lógica del componente
}
```

**`src/app/features/products/products.html`**

```html
<div class="card">
  <h1>Products</h1>
  <!-- Contenido del módulo -->
</div>
```

**`src/app/features/products/products.css`**

```css
/* Estilos específicos del módulo */
```

#### 3. Crear Rutas del Módulo (Opcional)

Si el módulo tiene múltiples páginas, crea un archivo de rutas:

**`src/app/features/products/products.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { Products } from './products';
import { ProductList } from './pages/product-list/product-list';
import { ProductDetail } from './pages/product-detail/product-detail';

export const productsRoutes: Routes = [
  {
    path: '',
    component: Products,
    children: [
      { path: '', component: ProductList },
      { path: ':id', component: ProductDetail },
    ],
  },
];
```

#### 4. Registrar las Rutas en `app.routes.ts`

**`src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Home },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes)
      },
    ],
  },
];
```

#### 5. Agregar al Menú (Opcional)

Edita `src/app/layout/component/app.menu.ts` para agregar la nueva opción:

```typescript
this.model = [
  {
    label: 'Inicio',
    items: [{ label: 'Bandeja de Entrada', icon: 'pi pi-fw pi-inbox', routerLink: ['/'] }],
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Productos', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/products'] },
      // ... otros items
    ],
  },
];
```

### Estructura Interna de un Módulo

Cada módulo debe seguir esta estructura interna:

```
products/
├── components/          # Componentes reutilizables del módulo
│   └── product-card/
│       ├── product-card.ts
│       ├── product-card.html
│       └── product-card.css
│
├── models/             # Interfaces, tipos y modelos
│   └── product.model.ts
│
├── pages/              # Páginas del módulo (si tiene múltiples rutas)
│   ├── product-list/
│   │   ├── components/     # Componentes específicos de esta página
│   │   ├── models/         # Modelos específicos de esta página
│   │   ├── services/       # Servicios específicos de esta página
│   │   ├── product-list.ts
│   │   ├── product-list.html
│   │   └── product-list.css
│   └── product-detail/
│
├── services/           # Servicios del módulo
│   └── product.service.ts
│
├── products.ts         # Componente principal
├── products.html
├── products.css
└── products.routes.ts  # Rutas (opcional)
```

### Crear un Componente dentro de un Módulo

**`src/app/features/products/components/product-card/product-card.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
}
```

### Crear un Servicio

**`src/app/features/products/services/product.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root', // O 'any' si solo se usa en este módulo
})
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
```

### Crear un Modelo

**`src/app/features/products/models/product.model.ts`**

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
```

## 🎨 Componentes de la Plantilla

### PrimeNG

El proyecto utiliza PrimeNG v20. Para usar componentes de PrimeNG:

```typescript
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, DialogModule],
  // ...
})
```

**Ejemplo de uso en el template:**

```html
<p-button label="Guardar" icon="pi pi-check" (onClick)="save()"></p-button>

<p-table [value]="products" [paginator]="true" [rows]="10">
  <ng-template pTemplate="header">
    <tr>
      <th>Nombre</th>
      <th>Precio</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.price }}</td>
    </tr>
  </ng-template>
</p-table>
```

### PrimeIcons

Los iconos se usan con la clase `pi`:

```html
<i class="pi pi-home"></i>
<i class="pi pi-user"></i>
<i class="pi pi-check"></i>
```

Ver todos los iconos disponibles en: [PrimeIcons](https://primeng.org/icons)

### Tailwind CSS

El proyecto incluye Tailwind CSS v4. Usa clases de utilidad:

```html
<div class="flex items-center justify-between p-4 bg-surface-0 dark:bg-surface-900">
  <h1 class="text-2xl font-bold text-primary">Título</h1>
  <button class="px-4 py-2 bg-primary text-white rounded">Botón</button>
</div>
```

### Layout Service

El `LayoutService` gestiona el estado del layout. Úsalo para controlar el sidebar, tema, etc.:

```typescript
import { LayoutService } from '@app/layout/service/layout.service';

constructor(private layoutService: LayoutService) {}

toggleSidebar() {
  this.layoutService.onMenuToggle();
}

toggleDarkMode() {
  this.layoutService.layoutConfig.update((config) => ({
    ...config,
    darkTheme: !config.darkTheme,
  }));
}
```

### Sistema de Temas

El proyecto soporta múltiples temas de PrimeUI:

- **Aura** (por defecto)
- **Lara**
- **Nora**

Los usuarios pueden cambiar el tema desde el configurador en el topbar.

## 📝 Convenciones de Código

### Nombres de Archivos

- **Componentes**: `kebab-case.component.ts` (ej: `product-card.ts`)
- **Servicios**: `kebab-case.service.ts` (ej: `product.service.ts`)
- **Modelos**: `kebab-case.model.ts` (ej: `product.model.ts`)
- **Rutas**: `kebab-case.routes.ts` (ej: `products.routes.ts`)

### Nombres de Clases

- **Componentes**: `PascalCase` (ej: `ProductCard`)
- **Servicios**: `PascalCase` + `Service` (ej: `ProductService`)
- **Interfaces**: `PascalCase` (ej: `Product`, `UserProfile`)

### Estructura de Componentes

```typescript
// 1. Imports de Angular
import { Component, Input, Output, EventEmitter } from '@angular/core';

// 2. Imports de PrimeNG
import { ButtonModule } from 'primeng/button';

// 3. Imports de módulos compartidos
import { CommonModule } from '@angular/common';

// 4. Imports locales (relativos)
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  // 1. Propiedades públicas
  @Input() product!: Product;
  @Output() productSelected = new EventEmitter<Product>();

  // 2. Propiedades privadas
  private isSelected = false;

  // 3. Constructor
  constructor(private productService: ProductService) {}

  // 4. Métodos públicos
  selectProduct() {
    this.isSelected = true;
    this.productSelected.emit(this.product);
  }

  // 5. Métodos privados
  private validateProduct() {
    // ...
  }
}
```

### Manejo de Estado

- Usa **Signals** para estado reactivo local
- Usa **RxJS Observables** para operaciones asíncronas
- Usa **Services** para estado compartido

```typescript
import { signal, computed } from '@angular/core';

export class ProductList {
  // Signals
  products = signal<Product[]>([]);
  loading = signal(false);
  
  // Computed signals
  totalProducts = computed(() => this.products().length);
  
  // Observables
  products$ = this.productService.getProducts();
}
```

## 🎯 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start
# o
ng serve

# El servidor estará disponible en http://localhost:4200
```

### Construcción

```bash
# Construir para producción
npm run build
# o
ng build

# Los archivos se generarán en dist/
```

### Testing

```bash
# Ejecutar tests unitarios
npm test
# o
ng test
```

## 📚 Recursos Adicionales

### Documentación Oficial

- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [PrimeUI Themes](https://themes.primeng.org)

### Estructura de Menú

El menú se configura en `src/app/layout/component/app.menu.ts`. Usa la estructura de `MenuItem` de PrimeNG:

```typescript
{
  label: 'Categoría',
  items: [
    { 
      label: 'Item', 
      icon: 'pi pi-fw pi-icon-name', 
      routerLink: ['/route'] 
    }
  ]
}
```

### Rutas Protegidas

Para proteger rutas, crea guards en `app/core/guards/`:

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // Lógica de autenticación
  return true; // o false
};
```

Luego úsalo en las rutas:

```typescript
{
  path: 'protected',
  component: ProtectedComponent,
  canActivate: [authGuard]
}
```

## 🤝 Contribución

Al crear un nuevo módulo o funcionalidad:

1. Sigue la estructura de carpetas establecida
2. Usa componentes standalone
3. Documenta servicios y funciones complejas
4. Mantén los componentes pequeños y enfocados
5. Reutiliza componentes compartidos cuando sea posible
6. Sigue las convenciones de nombres
7. Escribe código limpio y mantenible


