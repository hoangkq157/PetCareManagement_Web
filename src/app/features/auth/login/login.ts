import { Component, inject, signal } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { RouterLink }    from '@angular/router';
import { CommonModule }  from '@angular/common';
import { AuthService }   from '../../../core/auth.service';
import { Router }        from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = signal('');
  matKhau  = signal('');
  loading  = signal(false);
  error    = signal('');

  login(): void {
    if (!this.email() || !this.matKhau()) {
      this.error.set('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email(), this.matKhau()).subscribe({
      next: (user) => {
        this.router.navigate([user.loai === 'NhanVien' ? '/admin' : '/owner']);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Đăng nhập thất bại.');
        this.loading.set(false);
      }
    });
  }
}