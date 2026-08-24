import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/components/login/login';
import { CustomerListComponent } from './features/customers/components/customer-list/customer-list';
import { SupplierListComponent } from './features/suppliers/components/supplier-list/supplier-list';
import { ProductSaleListComponent } from './features/productsale/components/productsale-list/productsale-list';
import { DashboardComponent } from './features/dashboards/components/dashboard-home/dashboard-home';
const routes: Routes = [
  { path: 'login',            component: LoginComponent },
  { path: '',                 redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',        component: DashboardComponent,        canActivate: [authGuard] },
  { path: 'clientes',         component: CustomerListComponent,      canActivate: [authGuard], data: { roles: ['Administrador', 'Gerente Operaciones'] } },
  { path: 'proveedores',      component: SupplierListComponent,      canActivate: [authGuard], data: { roles: ['Administrador', 'Gerente Operaciones'] } },
  { path: 'productos-venta',  component: ProductSaleListComponent,   canActivate: [authGuard], data: { roles: ['Administrador', 'Responsable Inventario'] } },
  { path: '**',               redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



