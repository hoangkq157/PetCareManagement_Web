import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email   = signal('');
  loading = signal(false);
  error   = signal('');
  success = signal('');

  guiOtp(): void {
    const email = this.email().trim();

    if (!email) {
      this.error.set('Vui lòng nhập địa chỉ email.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.auth.quenMatKhau(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);

        // Lưu email tạm để các bước sau dùng (không lưu mật khẩu/OTP)
        sessionStorage.setItem('pc_reset_email', email);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Không kết nối được máy chủ. Vui lòng thử lại sau.');
        } else {
          this.error.set(err.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
      }
    });
  }

  tiepTuc(): void {
    this.router.navigate(['/xacminhotp']);
  }
}