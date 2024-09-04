import { userDetailsResolver } from './core/resolvers/user-details.resolver';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './pages/signup/signup.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login-operation/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { loginGuard } from './core/guards/login.guard';
import { RazorpayFlowComponent } from './core/reused/razorpay-flow/razorpay-flow.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  //login-operation
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
    canActivate: [loginGuard],
  },
  {
    path: 'registeruser',
    loadComponent: () =>
      import(
        './pages/login-operation/register-user/register-user.component'
      ).then((m) => m.RegisterUserComponent),
    title: 'Register User',
    canActivate: [loginGuard],
  },
  {
    path: 'forgotpassword',
    loadComponent: () =>
      import(
        './pages/login-operation/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
    title: 'Forgot Password',
    canActivate: [loginGuard],
  },
  {
    path: 'resetpassword/:resettoken',
    loadComponent: () =>
      import(
        './pages/login-operation/reset-password/reset-password.component'
      ).then((m) => m.ResetPasswordComponent),
    title: 'Reset Password',
    canActivate: [loginGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'Sign Up',
  },

  {
    path: 'razorpay-demo',
    component: RazorpayFlowComponent,
    title: 'Razorpay Demo',
  },

  //main components

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './pages/dashboard/client-dashboard/client-dashboard.component'
          ).then((m) => m.ClientDashboardComponent),
        title: 'Dashboard',
        canActivate: [authGuard],
      },

      //property-setup components

      {
        path: 'property-setup/:propertyUnitId',
        loadComponent: () =>
          import(
            './pages/property-setup/add-update-property/add-update-property.component'
          ).then((m) => m.AddUpdatePropertyComponent),
        title: 'Property Setup',
        canActivate: [authGuard],
      },

      {
        path: 'roomtype-setup/:propertyUnitId/:roomTypeId',
        loadComponent: () =>
          import(
            './pages/property-setup/room-type-range-setup/room-type-range-setup.component'
          ).then((m) => m.RoomTypeRangeSetupComponent),
        title: 'RoomType Setup',
        canActivate: [authGuard],
      },
      {
        path: 'rooms-review/:propertyUnitId',
        loadComponent: () =>
          import(
            './pages/property-setup/rooms-review/rooms-review.component'
          ).then((m) => m.RoomsReviewComponent),
        title: 'Rooms Review',
        canActivate: [authGuard],
      },
      {
        path: 'tax-setup/:propertyUnitId',
        loadComponent: () =>
          import('./pages/property-setup/tax-set/tax-set.component').then(
            (m) => m.TaxSetComponent
          ),
        title: 'Tax Setup',
        canActivate: [authGuard],
      },
      {
        path: 'rateplan-setup/:propertyUnitId',
        loadComponent: () =>
          import('./pages/property-setup/rateplan/rateplan.component').then(
            (m) => m.RateplanComponent
          ),
        title: 'RatePlan Setup',
        canActivate: [authGuard],
      },

      {
        path: 'profile',
        component: UserProfileComponent,
        title: 'User Profile',
        resolve: { userDetails: userDetailsResolver },
      },

      //reservation collection

      {
        path: 'create-reservation',
        loadComponent: () =>
          import(
            './pages/reservation-collection/create-reservation/create-reservation.component'
          ).then((m) => m.CreateReservationComponent),
        title: 'Create Reservation',
        canActivate: [authGuard],
      },
      {
        path: 'reservation-info',
        loadComponent: () =>
          import(
            './pages/reservation-collection/reservation-info/reservation-info.component'
          ).then((m) => m.ReservationInfoComponent),
        title: 'Reservation Info',
        canActivate: [authGuard],
      },
      {
        path: 'reservation-payment',
        loadComponent: () =>
          import(
            './pages/reservation-collection/create-reservation-payment/create-reservation-payment.component'
          ).then((m) => m.CreateReservationPaymentComponent),
        title: 'Reservation Payment',
        canActivate: [authGuard],
      },
      {
        path: 'guest-folio/:groupId',
        loadComponent: () =>
          import(
            './pages/reservation-collection/guest-folio/guest-folio.component'
          ).then((m) => m.GuestFolioComponent),
        title: 'Guest Folio',
        canActivate: [authGuard],
      },

      //room collection

      {
        path: 'room-maintenance/:propertyUnitId',
        loadComponent: () =>
          import(
            './pages/room-operation/room-maintenance/room-maintenance.component'
          ).then((m) => m.RoomMaintenanceComponent),
        title: 'Room Maintenance',
        canActivate: [authGuard],
      },
      {
        path: 'house-keeping/:propertyUnitId',
        loadComponent: () =>
          import(
            './pages/room-operation/house-keeping/house-keeping.component'
          ).then((m) => m.HouseKeepingComponent),
        title: 'House Keeping',
        canActivate: [authGuard],
      },
    ],
  },

  //wild card route
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Page Not Found',
  },
];
