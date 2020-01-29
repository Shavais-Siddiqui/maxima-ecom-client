import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})

export class SignInComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  returnUrl: string;
  private user: SocialUser;
  private loggedIn: boolean;
  private subscription: Subscription = new Subscription();

  constructor(private appService: AppService, private route: ActivatedRoute, public formBuilder: FormBuilder, public router: Router, public snackBar: MatSnackBar, public authService: AuthService, public auth: AuthenticationService) {
    let token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.returnUrl = JSON.parse(localStorage.getItem('returnUrl')) || '/';
    this.authService.authState.pipe(take(1)).subscribe((user) => {
      console.log(user)
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.loggedIn)
      if (this.loggedIn) {
        console.log('Inside func call');
        this.login(user);
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
    this.authService.authState.pipe(take(1)).subscribe((user) => {
      console.log(user, "Inside Google func call 64")
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.loggedIn, "Inside Google func call 67" )
      if (this.loggedIn) {
        console.log('Inside Google func call');
        this.login(user);
      }
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    this.authService.authState.pipe(take(1)).subscribe((user) => {
      console.log(user, 'Inside fb func call 78')
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.loggedIn, 'Inside fb func call 81')
      if (this.loggedIn) {
        console.log('Inside fb func call');
        this.login(user);
      }
    });
  }

  public onLoginFormSubmit(values: Object): void {
    if (this.loginForm.valid) {
      let loginData = {
        email: this.loginForm.get('email').value,
        password: this.loginForm.get('password').value,
        provider: 'MAIL'
      }
      this.login(loginData);
    }
  }

  public onRegisterFormSubmit(values: Object): void {
    if (this.registerForm.valid) {
      this.auth.addUser(this.registerForm.value).subscribe((res: any) => {
        localStorage.setItem('token', res.token);
        this.auth.user = res.data;
        this.auth.updateLoggedInStatus(true);
        this.auth.updateActiveState(false);
        this.snackBar.open('You registered successfully, please verify your Email.', '×', { panelClass: 'success', verticalPosition: 'top', duration: 5000 });
        this.router.navigate(['/']);
      })
    }
  }

  ngOnDestroy() {
  }

  login(data) {
    console.log('Login called');
    this.auth.login(data).subscribe((res: any) => {
      console.log('Login response', res)
      localStorage.setItem('token', res.token);
      this.auth.user = res.data;

      let dbList = [];
      let totalItems = [];

      if (res.data.cart.length > 0) {
        dbList = res.data.cart.map(x => {
          x.productId.cartCount = x.cartCount;
          return x.productId
        })
        totalItems = dbList;
      }

      let localItems = JSON.parse(localStorage.getItem('cartList'))
      if (localItems) {
        localStorage.removeItem('cartList');
        totalItems = localItems.concat(dbList);
        if (dbList.length > 0) {
          totalItems = totalItems.filter((item, index, self) => {
            return index === self.findIndex((t) => {
              return t._id === item._id
            })
          })
        }

        let userCart = totalItems.map(x => {
          return {
            cartCount: x.cartCount,
            productId: x
          }
        })
        this.auth.user.cart = userCart;

        let cartList = totalItems.map(x => {
          return {
            cartCount: x.cartCount,
            productId: x._id
          }
        })
        this.auth.updateUser({
          cart: cartList
        }).subscribe(res => {
        })
      }
      this.appService.Data.cartList.length = 0;
      this.appService.Data.totalPrice = 0;
      this.appService.Data.totalCartCount = 0;
      if (totalItems.length > 0) {
        let userCart = totalItems.map(x => {
          return {
            cartCount: x.cartCount,
            productId: x
          }
        })
        this.auth.user.cart = userCart;
        this.appService.Data.cartList = totalItems;
        totalItems.forEach(product => {
          this.appService.Data.totalPrice = this.appService.Data.totalPrice + (product.cartCount * product.newPrice);
          this.appService.Data.totalCartCount = this.appService.Data.totalCartCount + product.cartCount;
        });
      }
      this.auth.updateActiveState(res.data.active);
      this.auth.updateLoggedInStatus(true);
      this.snackBar.open('Welcome again!.', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      this.router.navigateByUrl(this.returnUrl);
      localStorage.removeItem('returnUrl')
    })
  }

}
