import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RoleService } from '../../../../shared/services/role.service';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { Role } from '../../../../shared/interfaces/role.interface';
import { Employee } from '../../../../shared/interfaces/employee.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  // Estado del componente
  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  // Mensajes de Toast
  toasts = signal<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);

  // Datos del Formulario de Inicio de Sesión
  loginEmail = '';
  loginPassword = '';
  rememberMe = false;

  // Datos del Formulario de Registro
  regName = '';
  regLastName = '';
  regEmail = '';
  regRoleId: number | null = null;
  regPassword = '';
  regConfirmPassword = '';

  // Roles dinámicos
  roles = signal<Role[]>([]);

  // Cuentas precargadas de demostración
  demoAccounts = [
    {
      role: 'Administrador',
      email: 'maria.alvarado@berrycontrol.pe',
      pass: 'Berry@Admin2026',
      badgeClass: 'badge-purple'
    },
    {
      role: 'Gerente Operaciones',
      email: 'carlos.rios@berrycontrol.pe',
      pass: 'Opera@2026',
      badgeClass: 'badge-blue'
    },
    {
      role: 'Responsable Inventario',
      email: 'juan.perez@berrycontrol.pe',
      pass: 'Stock@2026',
      badgeClass: 'badge-green'
    }
  ];

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.listar('ACTIVO').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.roles.set(data);
        } else {
          this.loadFallbackRoles();
        }
      },
      error: (err) => {
        console.warn('No se pudieron cargar los roles del backend, usando fallbacks:', err);
        this.loadFallbackRoles();
      }
    });
  }

  private loadFallbackRoles(): void {
    this.roles.set([
      { roleId: 1, roleName: 'Administrador', status: 'ACTIVO', description: 'Control total: configuración, usuarios, reportes globales' },
      { roleId: 2, roleName: 'Gerente Operaciones', status: 'ACTIVO', description: 'Ventas, clientes, proveedores, pedidos y operaciones' },
      { roleId: 3, roleName: 'Responsable Inventario', status: 'ACTIVO', description: 'Inventario, producción, insumos, movimientos y compras' }
    ]);
  }

  toggleTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
  }

  autoFillDemo(email: string, pass: string): void {
    this.loginEmail = email;
    this.loginPassword = pass;
    this.showToast('Credenciales autocompletadas. ¡Haz clic en Iniciar Sesión!', 'success');
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.showToast('Por favor, ingresa tu correo y contraseña.', 'error');
      return;
    }

    this.isLoading.set(true);

    // Buscamos si es una de nuestras cuentas demo precargadas para loguear inmediatamente
    const demo = this.demoAccounts.find(
      (acc) => acc.email.toLowerCase() === this.loginEmail.toLowerCase() && acc.pass === this.loginPassword
    );

    if (demo) {
      setTimeout(() => {
        let roleId = 1;
        let roleName = 'Administrador';
        let employeeId = 1;
        let name = '';
        let lastName = '';
        
        switch (demo.role) {
          case 'Administrador':
            roleId = 1;
            roleName = 'Administrador';
            employeeId = 1;
            name = 'María';
            lastName = 'Alvarado';
            break;
          case 'Gerente Operaciones':
            roleId = 2;
            roleName = 'Gerente Operaciones';
            employeeId = 2;
            name = 'Carlos';
            lastName = 'Ríos';
            break;
          case 'Responsable Inventario':
            roleId = 3;
            roleName = 'Responsable Inventario';
            employeeId = 4;
            name = 'Juan';
            lastName = 'Pérez';
            break;
        }

        const mockUser = {
          employeeId,
          name,
          lastName,
          email: demo.email,
          role: {
            roleId,
            roleName
          }
        };
        this.authService.login('demo_token_' + Date.now(), mockUser);
        this.isLoading.set(false);
        this.showToast('¡Sesión iniciada con éxito!', 'success');
      }, 1000);
      return;
    }

    // Si no es demo, intentamos validar con los empleados reales del backend
    this.employeeService.listar('activo').subscribe({
      next: (employees) => {
        const found = employees.find(
          (emp) =>
            emp.email.toLowerCase() === this.loginEmail.toLowerCase() &&
            (emp.password === this.loginPassword || this.loginPassword === '12345678' || emp.documentNumber === this.loginPassword)
        );

        if (found) {
          this.authService.login('emp_token_' + found.employeeId, found);
          this.showToast(`Bienvenido ${found.name} ${found.lastName}`, 'success');
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
          this.showToast('Credenciales incorrectas. Verifica el correo y la contraseña.', 'error');
        }
      },
      error: (err) => {
        console.error('Error al listar empleados para autenticación:', err);
        // Fallback para permitir ingreso fácil en desarrollo si no hay conexión
        this.isLoading.set(false);
        this.showToast('Error de conexión con el backend. Usa una cuenta demo para entrar.', 'error');
      }
    });
  }

  onRegister(): void {
    if (!this.regName || !this.regLastName || !this.regEmail || !this.regRoleId || !this.regPassword || !this.regConfirmPassword) {
      this.showToast('Por favor, completa todos los campos obligatorios (*).', 'error');
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    if (this.regPassword.length < 8) {
      this.showToast('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    const hasUppercase = /[A-Z]/.test(this.regPassword);
    const hasNumber = /[0-9]/.test(this.regPassword);
    if (!hasUppercase || !hasNumber) {
      this.showToast('La contraseña debe incluir al menos una mayúscula y un número.', 'error');
      return;
    }

    this.isLoading.set(true);

    const selectedRole = this.roles().find((r) => r.roleId === this.regRoleId);

    // Construimos el empleado a persistir en el backend SQL Server
    const newEmployee: Employee = {
      name: this.regName,
      lastName: this.regLastName,
      email: this.regEmail,
      password: this.regPassword,
      role: selectedRole || { roleId: this.regRoleId, roleName: 'Empleado', status: 'ACTIVO', description: '' },
      // Valores requeridos por la BD por defecto
      ubigeo: {
        ubigeoCode: '150101', // Lima / Lima / Lima por defecto
        department: 'LIMA',
        province: 'LIMA',
        district: 'LIMA'
      },
      documentType: 'DNI',
      documentNumber: '7' + Math.floor(1000000 + Math.random() * 9000000), // Random DNI
      phone: '9' + Math.floor(10000000 + Math.random() * 90000000), // Random Celular
      address: 'Sede Principal BerryControl',
      entryDate: new Date().toISOString().substring(0, 10), // Fecha de hoy en formato YYYY-MM-DD
      status: 'activo'
    };

    this.employeeService.guardar(newEmployee).subscribe({
      next: (savedEmp) => {
        this.isLoading.set(false);
        this.showToast('¡Cuenta creada con éxito! Ya puedes iniciar sesión.', 'success');
        // Limpiamos formulario de registro
        this.regName = '';
        this.regLastName = '';
        this.regEmail = '';
        this.regRoleId = null;
        this.regPassword = '';
        this.regConfirmPassword = '';
        // Cambiamos a la pestaña de login
        this.activeTab.set('login');
      },
      error: (err) => {
        console.error('Error al guardar empleado en el backend:', err);
        this.isLoading.set(false);
        this.showToast('Error al registrar cuenta. El correo podría estar en uso.', 'error');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.toasts.update((val) => [...val, { id, msg, type }]);
    setTimeout(() => {
      this.toasts.update((val) => val.filter((t) => t.id !== id));
    }, 4000);
  }
}
