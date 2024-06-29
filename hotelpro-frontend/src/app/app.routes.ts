import { userDetailsResolver } from './core/resolvers/user-details.resolver';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './pages/signup/signup.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'user',
    loadChildren: () =>
      import('../app/pages/login-operation/login-operation.module').then(
        (m) => m.LoginOperationModule
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../app/pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        resolve: { userDetails: userDetailsResolver },
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
