import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuth = new BehaviorSubject<boolean>(false);
  private apiUrl = '/hotelpro/user/login';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true,
  };

  constructor(private router: Router, private http: HttpClient) {
    this.autoLogIn();
  }

  autoLogIn() {
    if (this.isAuth.value) {
      this.router.navigate(['/dashboard']);
    }
  }

  logOut() {
    this.isAuth.next(false);
    this.router.navigate(['/login']);
  }

  logIn(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, this.httpOptions).pipe(
      tap(() => {
        this.isAuth.next(true);
        this.router.navigate(['/dashboard']);
        // Set isAuth to true after successful login
      }),
      catchError(this.handleError)
    );
  }
  getAuthStatus(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message));
  }
}
