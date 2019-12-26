import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;

  private user: SocialUser;
  private loggedIn: boolean;
  private subscription: Subscription = new Subscription();

  constructor(public formBuilder: FormBuilder, public router: Router, public snackBar: MatSnackBar, public authService: AuthService, public auth: AuthenticationService) {
    let token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      if (this.loggedIn) {
        this.auth.login(user).subscribe((res: any) => {
          localStorage.setItem('token', res.token);
          this.auth.user = res.data;
          this.auth.updateLoggedInStatus(true);
          this.router.navigate(['/']);
        })
      }
    });

    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });

    this.registerForm = this.formBuilder.group({
      'name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.required],
      'confirmPassword': ['', Validators.required]
    }, { validator: matchingPasswords('password', 'confirmPassword') });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  public onLoginFormSubmit(values: Object): void {
    if (this.loginForm.valid) {
      let loginData = {
        email: this.loginForm.get('email'),
        password: this.loginForm.get('password'),
        provider: 'MAIL'
      }
      this.auth.login(loginData).subscribe((res: any) => {
        localStorage.setItem('token', res.token);
        this.auth.user = res.data;
        this.auth.updateLoggedInStatus(true);
        this.snackBar.open('Welcome again!.', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(['/']);
      })
    }
  }

  public onRegisterFormSubmit(values: Object): void {
    if (this.registerForm.valid) {
      this.auth.addUser(this.registerForm.value).subscribe((res: any) => {
        localStorage.setItem('token', res.token);
        this.auth.user = res.data;
        this.auth.updateLoggedInStatus(true);
        this.snackBar.open('You registered successfully, please verify your Email.', '×', { panelClass: 'success', verticalPosition: 'top', duration: 5000 });
        this.router.navigate(['/']);
      })
    }
  }

  ngOnDestroy() {

  }

}
