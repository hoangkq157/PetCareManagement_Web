import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }   from '../../../core/auth.service';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-profile.html',
  styleUrl: './owner-profile.css'
})
export class OwnerProfileComponent implements OnInit {
  private auth  = inject(AuthService);
  private cnSvc = inject(ChuNuoiService);

  loading  = signal(true);
  saving   = signal(false);
  msg      = signal('');
  msgType  = signal<'ok'|'err'>('ok');
  error    = signal('');

  hoTen       = signal('');
  email       = signal('');
  soDienThoai = signal('');
  diaChi      = signal('');

  // Đổi mật khẩu
  showPassForm = signal(false);
  matKhauCu    = signal('');
  matKhauMoi   = signal('');
  matKhauXN    = signal('');
  passError    = signal('');
  passSaving   = signal(false);

  ngOnInit(): void {
    const id = this.auth.user()?.id;
    if (!id) { this.loading.set(false); return; }
    this.cnSvc.getById(id).subscribe({
      next: cn => {
        this.hoTen.set(cn.hoTen);
        this.email.set(cn.email);
        this.soDienThoai.set(cn.soDienThoai ?? '');
        this.diaChi.set(cn.diaChi ?? '');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  luu(): void {
    const id = this.auth.user()?.id;
    if (!id || !this.hoTen().trim()) { this.error.set('Họ tên không được để trống.'); return; }
    this.saving.set(true); this.error.set('');
    this.cnSvc.update(id, {
      hoTen: this.hoTen().trim(),
      soDienThoai: this.soDienThoai().trim() || undefined,
      diaChi: this.diaChi().trim() || undefined
    }).subscribe({
      next: () => { this.saving.set(false); this.showMsg('Cập nhật hồ sơ thành công!', 'ok'); },
      error: () => { this.saving.set(false); this.showMsg('Cập nhật thất bại.', 'err'); }
    });
  }

  doiMatKhau(): void {
    if (!this.matKhauMoi().trim()) { this.passError.set('Vui lòng nhập mật khẩu mới.'); return; }
    if (this.matKhauMoi() !== this.matKhauXN()) { this.passError.set('Mật khẩu xác nhận không khớp.'); return; }
    if (this.matKhauMoi().length < 6) { this.passError.set('Mật khẩu mới phải ít nhất 6 ký tự.'); return; }
    const id = this.auth.user()?.id;
    if (!id) return;
    this.passSaving.set(true); this.passError.set('');
    this.cnSvc.update(id, { matKhau: this.matKhauMoi() }).subscribe({
      next: () => {
        this.passSaving.set(false); this.showPassForm.set(false);
        this.matKhauCu.set(''); this.matKhauMoi.set(''); this.matKhauXN.set('');
        this.showMsg('Đổi mật khẩu thành công!', 'ok');
      },
      error: () => { this.passSaving.set(false); this.passError.set('Đổi mật khẩu thất bại.'); }
    });
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 4000);
  }
}
