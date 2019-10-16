import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule'},
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule',
    canLoad: [AuthGuard]
  },
  { path: 'proxies', loadChildren: './proxies/proxies.module#ProxiesPageModule', canLoad: [AuthGuard] },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule', canLoad: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
