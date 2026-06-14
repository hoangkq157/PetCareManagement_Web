import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Router }      from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  hoTen       = signal('');
  email       = signal('');
  matKhau     = signal('');
  xacNhan     = signal('');
  soDienThoai = signal('');
  diaChi      = signal('');
  loading     = signal(false);
  error       = signal('');
  showPass    = signal(false);
  showXacNhan = signal(false);

  register(): void {
    const hoTen   = this.hoTen().trim();
    const email   = this.email().trim();
    const matKhau = this.matKhau();

    if (!hoTen || !email || !matKhau) {
      this.error.set('Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }
    if (matKhau !== this.xacNhan()) {
      this.error.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (matKhau.length < 6) {
      this.error.set('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.register({
      hoTen,
      email,
      matKhau,
      soDienThoai: this.soDienThoai().trim() || undefined,
      diaChi:      this.diaChi().trim()      || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/owner']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409 || err.status === 400) {
          this.error.set(err.error?.message ?? 'Email này đã được đăng ký.');
        } else if (err.status === 0) {
          this.error.set('Không kết nối được máy chủ. Vui lòng thử lại sau.');
        } else {
          this.error.set(err.error?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      }
    });
  }

  toggleShowPass():    void { this.showPass.set(!this.showPass()); }
  toggleShowXacNhan(): void { this.showXacNhan.set(!this.showXacNhan()); }
}
