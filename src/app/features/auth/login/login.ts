import { Component, inject, signal } from '@angular/core';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService }  from '../../../core/auth.service';
import { Router }       from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // ── Dependency Injection (Angular 21 style) ──────────────────────
  // inject() thay cho constructor — gọn hơn, không cần khai báo params
  private auth   = inject(AuthService);
  private router = inject(Router);

  // ── State signals ────────────────────────────────────────────────
  // signal() là reactive state của Angular — khi set() thì template tự re-render
  email       = signal('');
  matKhau     = signal('');
  loading     = signal(false);   // true khi đang chờ API trả về
  error       = signal('');      // chuỗi lỗi hiển thị dưới form
  showPass    = signal(false);   // toggle hiện/ẩn mật khẩu

  // ── Hàm chính: gọi API đăng nhập ─────────────────────────────────
  login(): void {
    // 1. Validate phía client trước khi gọi API
    //    .trim() loại bỏ khoảng trắng thừa người dùng vô tình gõ
    if (!this.email().trim() || !this.matKhau().trim()) {
      this.error.set('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    // 2. Bật loading, xoá lỗi cũ — tránh người dùng bấm nhiều lần
    this.loading.set(true);
    this.error.set('');

    // 3. Gọi AuthService.login() — service sẽ POST tới /api/auth/login
    //    AuthService xử lý:
    //      - Gắn Content-Type: application/json (HttpClient tự làm)
    //      - Nhận AuthResponse từ backend
    //      - Lưu UserInfo vào localStorage (trong tap())
    //      - Cập nhật signal _user (trong tap())
    this.auth.login(this.email().trim(), this.matKhau()).subscribe({

      // 4. next: API trả về 200 OK + UserInfo hợp lệ
      next: (user) => {
        this.loading.set(false);
        const destination = user.loai === 'NhanVien' ? '/admin' : '/owner';
        this.router.navigate([destination]);
      },

      // 5. error: API trả về lỗi (401, 400, 500, network...)
      error: (err) => {
        // Tắt loading để người dùng có thể thử lại
        this.loading.set(false);

        // Ưu tiên lấy message từ backend (AuthController trả { message: "..." })
        // Nếu không có thì fallback theo HTTP status
        if (err.status === 401) {
          this.error.set(err.error?.message ?? 'Email hoặc mật khẩu không đúng.');
        } else if (err.status === 0) {
          // status 0 = không kết nối được server (backend chưa chạy / sai port)
          this.error.set('Không kết nối được máy chủ. Vui lòng thử lại sau.');
        } else {
          this.error.set(err.error?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      }
    });
  }

  // ── Toggle hiện / ẩn mật khẩu ───────────────────────────────────
  toggleShowPass(): void {
    this.showPass.set(!this.showPass());
  }
}