import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'thu-cung',
    loadComponent: () => import('./thu-cung/thu-cung-list').then(m => m.ThuCungListComponent)
  },
  {
    path: 'thu-cung/them',
    loadComponent: () => import('./thu-cung/thu-cung-form').then(m => m.ThuCungFormComponent)
  },
  {
    path: 'thu-cung/:id/sua',
    loadComponent: () => import('./thu-cung/thu-cung-form').then(m => m.ThuCungFormComponent)
  },
  {
    path: 'chu-nuoi',
    loadComponent: () => import('./chu-nuoi/chu-nuoi-list').then(m => m.ChuNuoiListComponent)
  },
  {
    path: 'lich-hen',
    loadComponent: () => import('./lich-hen/lich-hen-list').then(m => m.LichHenListComponent)
  },
  {
    path: 'lich-hen/them',
    loadComponent: () => import('./lich-hen/lich-hen-form').then(m => m.LichHenFormComponent)
  },
  {
    path: 'lich-hen/:id/sua',
    loadComponent: () => import('./lich-hen/lich-hen-form').then(m => m.LichHenFormComponent)
  },
  {
    path: 'dich-vu',
    loadComponent: () => import('./dich-vu/dich-vu-list').then(m => m.DichVuListComponent)
  },
  {
    path: 'tiem-phong',
    loadComponent: () => import('./tiem-phong/tiem-phong-list').then(m => m.TiemPhongListComponent)
  },
  {
    path: 'tiem-phong/them',
    loadComponent: () => import('./tiem-phong/tiem-phong-form').then(m => m.TiemPhongFormComponent)
  },
  {
    path: 'tiem-phong/:id/sua',
    loadComponent: () => import('./tiem-phong/tiem-phong-form').then(m => m.TiemPhongFormComponent)
  },
  {
    path: 'hoa-don',
    loadComponent: () => import('./hoa-don/hoa-don-list').then(m => m.HoaDonListComponent)
  },
  {
    path: 'bao-cao',
    loadComponent: () => import('./bao-cao/bao-cao').then(m => m.BaoCaoComponent)
  },
  {
    path: 'nhan-vien',
    loadComponent: () => import('./nhan-vien/nhan-vien-list').then(m => m.NhanVienListComponent)
  },
  {
    path: 'chu-nuoi/:id',
    loadComponent: () => import('./chu-nuoi/chu-nuoi-detail').then(m => m.ChuNuoiDetailComponent)
  },
];
