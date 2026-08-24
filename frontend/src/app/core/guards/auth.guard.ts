import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Redirigir al login si no está autenticado
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.getUser();
  const userRole = user?.role?.roleName;

  // Si la ruta requiere ciertos roles, validar
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole) {
      router.navigate(['/dashboard']);
      return false;
    }
    const roleNormalized = userRole.toLowerCase().trim();
    const isAuthorized = requiredRoles.some(role => {
      const normalizedRole = role.toLowerCase().trim();
      // Permitir coincidencia flexible
      if (normalizedRole === 'responsable inventario' || normalizedRole === 'resp. inventario' || normalizedRole === 'inventario') {
        return roleNormalized === 'responsable inventario' || roleNormalized === 'resp. inventario' || roleNormalized === 'inventario';
      }
      if (normalizedRole === 'gerente operaciones' || normalizedRole === 'gerente de operaciones' || normalizedRole === 'gerente') {
        return roleNormalized === 'gerente operaciones' || roleNormalized === 'gerente de operaciones' || roleNormalized === 'gerente';
      }
      return roleNormalized === normalizedRole;
    });

    if (!isAuthorized) {
      // Redirigir al dashboard si no está autorizado para esta ruta específica
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
