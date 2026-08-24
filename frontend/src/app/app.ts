import { Component, signal, inject } from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('berrycontrol');
  authService = inject(AuthService);
}

