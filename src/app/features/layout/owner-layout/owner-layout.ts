import { Component } from '@angular/core';
import { RouterOutlet }    from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';
import { ChatbotWidgetComponent } from '../../owner/chatbot/chatbot-widget';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatbotWidgetComponent],
  template: `
    <app-navbar />
    <div class="layout-shell">
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
    <app-chatbot-widget />
  `,
  styles: [`
    .layout-shell { display: flex; flex-direction: column; min-height: calc(100vh - 60px); }
    .main-content { flex: 1 0 auto; padding: 20px; background: #fafaf8; }
    app-footer    { flex-shrink: 0; }
  `]
})
export class OwnerLayoutComponent {}
