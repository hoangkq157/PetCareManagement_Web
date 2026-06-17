import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router }    from '@angular/router';
import { AuthService }               from '../../../core/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div style="text-align:center; margin-top: 80px; font-family: sans-serif">
      <p>⏳ Đang xử lý đăng nhập...</p>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private auth   = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const p      = this.route.snapshot.queryParamMap;
    const token  = p.get('token')  ?? '';
    const hoTen  = p.get('hoTen')  ?? '';
    const id     = p.get('id')     ?? '0';
    const loai   = p.get('loai')   ?? 'ChuNuoi';
    const vaiTro = p.get('vaiTro') ?? 'ChuNuoi';

    if (id !== '0') {
      this.auth.handleGoogleCallback(token, hoTen, id, loai, vaiTro);
      this.router.navigate(['/owner']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}