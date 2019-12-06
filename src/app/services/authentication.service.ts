import { Injectable } from '@angular/core';
import { AuthService } from "angularx-social-login";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private authService: AuthService) { }

  signOut(): void {
    this.authService.signOut();
  }
}
