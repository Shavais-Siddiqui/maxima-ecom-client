import { Injectable } from '@angular/core';
import { AuthService } from "angularx-social-login";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private initialValue: boolean;
  private token = localStorage.getItem('token');
  public loggedIn;
  public isLoggedIn;

  constructor(private authService: AuthService) {
    this.token ? this.initialValue == true : this.initialValue == false;
    this.loggedIn = new BehaviorSubject<boolean>(this.initialValue);
    this.isLoggedIn = this.loggedIn.asObservable();
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn.next(loggedIn);
  }

  signOut(): void {
    this.authService.signOut();
    this.updateLoggedInStatus(false);
  }
}
