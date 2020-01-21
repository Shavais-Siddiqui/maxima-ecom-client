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
  public userstatusSubject;
  public user;
  public isUserActive;

  constructor(private authService: AuthService, private http: HttpClient) {
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
    this.loggedIn = new BehaviorSubject<boolean>(this.initialValue);
    this.isLoggedIn = this.loggedIn.asObservable();

    // Verified
    this.userstatusSubject = new BehaviorSubject<boolean>(true);
    this.isUserActive = this.userstatusSubject.asObservable();
    
  }

  initialStatus() {
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn.next(loggedIn);
  }

  updateActiveState(val) {
    this.userstatusSubject.next(val);
  }

  async signOut() {
    localStorage.removeItem('token');
    this.updateLoggedInStatus(false);
    try {
      await this.authService.signOut();
    }
    catch {
    }
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
      this.userstatusSubject.next(res.data.active)
    })
  }
}
