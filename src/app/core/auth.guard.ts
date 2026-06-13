import { inject }         from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }    from './auth.service';

// Guard cho NhanVien/Admin
export const nhanVienGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isNhanVien()) return true;
  router.navigate(['/login']);
  return false;
};

// Guard cho ChuNuoi
export const chuNuoiGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isChuNuoi()) return true;
  router.navigate(['/login']);
  return false;
};

// Guard chặn trang login nếu đã đăng nhập
export const loginGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  // Redirect tới đúng trang theo vai trò
  router.navigate([auth.isNhanVien() ? '/admin' : '/owner']);
  return false;
};