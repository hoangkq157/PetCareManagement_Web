import { Routes } from '@angular/router';

export const ownerRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/owner-home').then(m => m.OwnerHomeComponent)
  },
  {
    path: 'thu-cung',
    loadComponent: () => import('./thu-cung/owner-thu-cung').then(m => m.OwnerThuCungComponent)
  },
  {
    path: 'dat-lich',
    loadComponent: () => import('./dat-lich/dat-lich').then(m => m.DatLichComponent)
  },
  {
    path: 'lich-su',
    loadComponent: () => import('./lich-su/lich-su').then(m => m.LichSuComponent)
  },
  {
    path: 'tiem-phong',
    loadComponent: () => import('./tiem-phong/owner-tiem-phong').then(m => m.OwnerTiemPhongComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/owner-profile').then(m => m.OwnerProfileComponent)
  },
];
