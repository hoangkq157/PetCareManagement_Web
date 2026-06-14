import { Component } from '@angular/core';
import { RouterOutlet }    from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main-content { padding: 20px; background: #fafaf8; min-height: calc(100vh - 60px); }
  `]
})
export class OwnerLayoutComponent {}
