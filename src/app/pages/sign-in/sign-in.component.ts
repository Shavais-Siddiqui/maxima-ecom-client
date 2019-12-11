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
    this.auth.isLoggedIn.subscribe(res => {
      console.log(res, 'First obs')
      if (res == true) {
        this.router.navigate(['/']);
      } else {

        this.subscription.add(this.authService.authState.subscribe((user) => {
          console.log(user, 'Second obs')
          this.user = user;
          this.loggedIn = (user != null);
          if (this.loggedIn) {
            this.auth.verifySocialLogin(user).subscribe((res: any) => {
              console.log(res, 'Third obs')
              if (res.data.verfied) {
                localStorage.setItem('token', res.data.token);
                this.auth.updateLoggedInStatus(true);
                console.log('User loged in!', res.data)
                this.router.navigate(['/']);
              }
            })
          }
        }))


      }
    });
  }

  ngOnInit() {

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
      this.router.navigate(['/']);
    }
  }

  public onRegisterFormSubmit(values: Object): void {
    if (this.registerForm.valid) {
      this.snackBar.open('You registered successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
