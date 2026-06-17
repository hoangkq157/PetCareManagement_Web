import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private auth   = inject(AuthService);
  private router = inject(Router);

  otp        = signal('');
  loading    = signal(false);
  error      = signal('');
  email      = signal('');
  secondsLeft = signal(300); // 5 phút

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const email = sessionStorage.getItem('pc_reset_email');
    if (!email) {
      // Chưa qua bước 1 -> đẩy về forgot-password
      this.router.navigate(['/quenmatkhau']);
      return;
    }
    this.email.set(email);

    this.timerId = setInterval(() => {
      const next = this.secondsLeft() - 1;
      if (next <= 0) {
        this.secondsLeft.set(0);
        if (this.timerId) clearInterval(this.timerId);
      } else {
        this.secondsLeft.set(next);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  get countdownText(): string {
    if (this.secondsLeft() <= 0) return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
    const m = Math.floor(this.secondsLeft() / 60);
    const s = this.secondsLeft() % 60;
    return `Mã hết hạn sau ${m}:${s.toString().padStart(2, '0')}`;
  }

  onOtpInput(value: string): void {
    this.otp.set(value.replace(/\D/g, '').slice(0, 6));
  }

  xacMinh(): void {
    const otp = this.otp().trim();

    if (otp.length !== 6) {
      this.error.set('Vui lòng nhập đầy đủ 6 số.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.xacMinhOtp(this.email(), otp).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/datlaimatkhau']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Không kết nối được máy chủ. Vui lòng thử lại sau.');
        } else {
          this.error.set(err.error?.message ?? 'Mã OTP không đúng.');
        }
      }
    });
  }
}