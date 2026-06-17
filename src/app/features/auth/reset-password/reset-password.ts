import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email          = signal('');
  matKhauMoi     = signal('');
  xacNhanMatKhau = signal('');
  loading        = signal(false);
  error          = signal('');
  showPass       = signal(false);
  showXacNhan    = signal(false);

  ngOnInit(): void {
    const email = sessionStorage.getItem('pc_reset_email');
    if (!email) {
      this.router.navigate(['/quenmatkhau']);
      return;
    }
    this.email.set(email);
  }

  get doManhMatKhau(): { label: string; percent: number; color: string } {
    const v = this.matKhauMoi();
    let score = 0;
    if (v.length >= 6)  score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const levels = [
      { label: 'Rất yếu',   percent: 20,  color: '#e53935' },
      { label: 'Yếu',       percent: 40,  color: '#fb8c00' },
      { label: 'Trung bình',percent: 60,  color: '#fdd835' },
      { label: 'Mạnh',      percent: 80,  color: '#43a047' },
      { label: 'Rất mạnh',  percent: 100, color: '#1e88e5' },
    ];
    return levels[Math.min(score, 4)];
  }

  datLai(): void {
    const matKhauMoi = this.matKhauMoi();
    const xacNhan    = this.xacNhanMatKhau();

    if (!matKhauMoi || matKhauMoi.length < 6) {
      this.error.set('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (matKhauMoi !== xacNhan) {
      this.error.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.datLaiMatKhau(this.email(), matKhauMoi, xacNhan).subscribe({
      next: () => {
        this.loading.set(false);
        sessionStorage.removeItem('pc_reset_email');
        this.router.navigate(['/login'], {
          queryParams: { resetSuccess: '1' }
        });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Không kết nối được máy chủ. Vui lòng thử lại sau.');
        } else {
          this.error.set(err.error?.message ?? 'Đặt lại mật khẩu thất bại.');
        }
      }
    });
  }

  toggleShowPass():    void { this.showPass.set(!this.showPass()); }
  toggleShowXacNhan(): void { this.showXacNhan.set(!this.showXacNhan()); }
}