import { Routes }        from '@angular/router';
import { nhanVienGuard,
         chuNuoiGuard,
         loginGuard }    from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Auth ────────────────────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'quenmatkhau',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'xacminhotp',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/verify-otp/verify-otp').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'datlaimatkhau',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },

  // ── Admin (NhanVien/Admin) ───────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [nhanVienGuard],
    loadComponent: () =>
      import('./features/layout/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // ── Owner (ChuNuoi) ──────────────────────────────────────────────────
  {
    path: 'owner',
    canActivate: [chuNuoiGuard],
    loadComponent: () =>
      import('./features/layout/owner-layout/owner-layout').then(m => m.OwnerLayoutComponent),
    loadChildren: () =>
      import('./features/owner/owner.routes').then(m => m.ownerRoutes)
  },

  { path: '**', redirectTo: 'login' }
];
