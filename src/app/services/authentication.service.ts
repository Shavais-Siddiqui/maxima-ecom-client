import { Injectable } from '@angular/core';
import { AuthService } from "angularx-social-login";
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private initialValue: boolean;
  private token;
  public loggedIn;
  public isLoggedIn;
  public baseUrl = 'https://maximaecommerceserver.herokuapp.com/api/'

  constructor(private authService: AuthService, private http: HttpClient) {
    console.log('Service')
    this.token = localStorage.getItem('token');
    this.token ? this.initialValue == true : this.initialValue == false;
    this.loggedIn = new BehaviorSubject<boolean>(this.initialValue);
    this.isLoggedIn = this.loggedIn.asObservable();
  }

  initialStatus() {
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn.next(loggedIn);
  }

  signOut(): void {
    this.authService.signOut();
    this.updateLoggedInStatus(false);
  }

  verifySocialLogin(data) {
    return this.http.post(this.baseUrl + 'check-social-login', data)
  }
}
