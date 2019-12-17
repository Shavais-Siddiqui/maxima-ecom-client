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
  public localUrl = 'http://localhost:3000/api/';
  public verified;
  public user;

  constructor(private authService: AuthService, private http: HttpClient) {
    console.log('Service')
    // Get token and verify its expiry
    this.token = localStorage.getItem('token');
    if (this.token) {
      // User is logged in
      this.initialValue = true
      // Get the updated data from the server using jwt
      this.getUserData();
    } else {
      this.initialValue = false;
    }
    console.log(this.initialValue)
    this.loggedIn = new BehaviorSubject<boolean>(this.initialValue);
    this.isLoggedIn = this.loggedIn.asObservable();

    // Verified
    // this.verified = new BehaviorSubject<boolean>(true);
    // this.isLoggedIn = this.loggedIn.asObservable();
  }

  initialStatus() {
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn.next(loggedIn);
  }

  signOut(): void {
    localStorage.removeItem('token');
    this.updateLoggedInStatus(false);
    this.authService.signOut();
  }

  verifySocialLogin(data) {
    return this.http.post(this.baseUrl + 'check-social-login', data)
  }

  addUser(data) {
    return this.http.post(this.baseUrl + 'add-user', data)
  }

  login(data) {
    return this.http.post(this.baseUrl + 'login', data)
  }

  verifyEmail(id) {
    return this.http.post(this.baseUrl + 'verify-email/' + id, 'e.g');
  }

  getUserData() {
    this.http.get(this.baseUrl + 'get-data').subscribe((res: any) => {
      this.user = res.data;
    })
  }
}
