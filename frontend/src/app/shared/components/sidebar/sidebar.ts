import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  badge?: number;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  authService = inject(AuthService);
  pedidosCount = signal<number | null>(null);
  filteredSections = signal<NavSection[]>([]);

  sections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        { label: 'Pedidos',     route: '/pedidos',     icon: 'pedidos' },
        { label: 'Clientes',    route: '/clientes',    icon: 'clientes' },
        { label: 'Proveedores', route: '/proveedores', icon: 'proveedores' },
        { label: 'Ventas',      route: '/ventas',      icon: 'ventas' },
      ],
    },
    {
      title: 'Inventario',
      items: [
        { label: 'Productos',   route: '/productos-venta', icon: 'productos' },
        { label: 'Insumos',     route: '/insumos',         icon: 'insumos' },
        { label: 'Compras',     route: '/compras',         icon: 'compras' },
        { label: 'Producción',  route: '/produccion',      icon: 'produccion' },
        { label: 'Movimientos', route: '/movimientos',     icon: 'movimientos' },
      ],
    },
    {
      title: 'Administración',
      items: [
        { label: 'Empleados',     route: '/empleados',     icon: 'empleados' },
        { label: 'Reportes',      route: '/reportes',      icon: 'reportes' },
        { label: 'Configuración', route: '/configuracion', icon: 'configuracion' },
      ],
    },
  ];

  ngOnInit(): void {
    this.pedidosCount.set(0);
    this.updateNavigation();
  }

  updateNavigation(): void {
    const user = this.authService.getUser();
    const role = user?.role?.roleName || '';
    
    const filtered = this.sections.map(section => {
      const items = section.items.filter(item => this.hasPermission(role, item.route));
      return { ...section, items };
    }).filter(section => section.items.length > 0);

    this.filteredSections.set(filtered);
  }

  hasPermission(role: string, route: string): boolean {
    const r = role.toLowerCase().trim();
    
    // El Administrador tiene acceso a todo
    if (r === 'administrador' || r === 'admin') {
      return true;
    }
    
    switch (route) {
      case '/dashboard':
        return true;
        
      case '/pedidos':
      case '/clientes':
      case '/proveedores':
      case '/ventas':
        return r === 'gerente operaciones' || r === 'gerente de operaciones' || r === 'gerente';
        
      case '/productos-venta':
      case '/insumos':
      case '/compras':
      case '/produccion':
      case '/movimientos':
        return r === 'responsable inventario' || r === 'resp. inventario' || r === 'inventario';
        
      case '/empleados':
      case '/reportes':
      case '/configuracion':
        return false; // Solo el admin (que ya fue controlado arriba)
        
      default:
        return false;
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.authService.getUser();
    if (!user) return 'US';
    const first = user.name ? user.name[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase() || 'US';
  }
}
