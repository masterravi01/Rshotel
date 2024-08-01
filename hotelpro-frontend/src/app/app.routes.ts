import { userDetailsResolver } from './core/resolvers/user-details.resolver';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './pages/signup/signup.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login-operation/login/login.component';
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
    path: 'registeruser',
    loadComponent: () =>
      import(
        './pages/login-operation/register-user/register-user.component'
      ).then((m) => m.RegisterUserComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'forgotpassword',
    loadComponent: () =>
      import(
        './pages/login-operation/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'resetpassword/:resettoken',
    loadComponent: () =>
      import(
        './pages/login-operation/reset-password/reset-password.component'
      ).then((m) => m.ResetPasswordComponent),
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
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'property-setup',
        loadChildren: () =>
          import('./pages/property-setup/property-setup.module').then(
            (m) => m.PropertySetupModule
          ),
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        resolve: { userDetails: userDetailsResolver },
      },
      {
        path: 'create-reservation',
        loadComponent: () =>
          import(
            './pages/reservation-collection/create-reservation/create-reservation.component'
          ).then((m) => m.CreateReservationComponent),
        canActivate: [authGuard],
      },
      {
        path: 'reservation-info',
        loadComponent: () =>
          import(
            './pages/reservation-collection/reservation-info/reservation-info.component'
          ).then((m) => m.ReservationInfoComponent),
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
