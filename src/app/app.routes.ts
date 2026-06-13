import { Routes }        from '@angular/router';
import { nhanVienGuard,
         chuNuoiGuard,
         loginGuard }    from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Auth (có loginGuard để redirect nếu đã đăng nhập) ────────────
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  // {
  //   path: 'register',
  //   canActivate: [loginGuard],
  //   loadComponent: () =>
  //     import('./features/auth/register/register').then(m => m.RegisterComponent)
  // },

  // // ── Admin (NhanVien/Admin) ────────────────────────────────────────
  // {
  //   path: 'admin',
  //   canActivate: [nhanVienGuard],
  //   loadComponent: () =>
  //     import('./features/layout/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
  //   children: [
  //     { path: '', redirectTo: 'thu-cung', pathMatch: 'full' },
  //     { path: 'thu-cung', loadChildren: () =>
  //         import('./features/thu-cung/thu-cung.routes').then(m => m.thuCungRoutes) },
  //     { path: 'chu-nuoi', loadChildren: () =>
  //         import('./features/chu-nuoi/chu-nuoi.routes').then(m => m.chuNuoiRoutes) },
  //     { path: 'lich-hen', loadChildren: () =>
  //         import('./features/lich-hen/lich-hen.routes').then(m => m.lichHenRoutes) },
  //     { path: 'dich-vu', loadChildren: () =>
  //         import('./features/dich-vu/dich-vu.routes').then(m => m.dichVuRoutes) },
  //     { path: 'tiem-phong', loadChildren: () =>
  //         import('./features/tiem-phong/tiem-phong.routes').then(m => m.tiemPhongRoutes) },
  //     { path: 'hoa-don', loadChildren: () =>
  //         import('./features/hoa-don/hoa-don.routes').then(m => m.hoaDonRoutes) },
  //     { path: 'bao-cao', loadChildren: () =>
  //         import('./features/bao-cao/bao-cao.routes').then(m => m.baoCaoRoutes) },
  //   ]
  // },

  // // ── Owner (ChuNuoi) ───────────────────────────────────────────────
  // {
  //   path: 'owner',
  //   canActivate: [chuNuoiGuard],
  //   loadComponent: () =>
  //     import('./features/layout/owner-layout/owner-layout').then(m => m.OwnerLayoutComponent),
  //   children: [
  //     { path: '', redirectTo: 'thu-cung', pathMatch: 'full' },
  //     { path: 'thu-cung', loadChildren: () =>
  //         import('./features/thu-cung/thu-cung.routes').then(m => m.thuCungRoutes) },
  //     { path: 'dat-lich', loadChildren: () =>
  //         import('./features/lich-hen/lich-hen.routes').then(m => m.lichHenRoutes) },
  //     { path: 'lich-su', loadChildren: () =>
  //         import('./features/lich-hen/lich-hen.routes').then(m => m.lichHenRoutes) },
  //   ]
  // },

  { path: '**', redirectTo: 'login' }
];