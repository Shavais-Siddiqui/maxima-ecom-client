import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

  constructor(private appService: AppService, private auth: AuthenticationService, private route: ActivatedRoute, public router: Router, private snackBar: MatSnackBar) {
    let id = this.route.snapshot.queryParamMap.get('key')
    this.auth.verifyEmail(id).subscribe((res: any) => {
      if (res.message == 'Approved') {
        localStorage.setItem('token', res.token);
        this.auth.user = res.data;

        if (res.data.cart.length > 0) {
          let cartItems = res.data.cart.map(x => {
            x.productId.cartCount = x.cartCount;
            return x.productId
          })
          let userCart = res.data.cart.map(x => {
            return {
              cartCount: x.cartCount,
              productId: x
            }
          })
          this.auth.user.cart = userCart;
          this.appService.Data.cartList = cartItems;
          cartItems.forEach(product => {
            this.appService.Data.totalPrice = this.appService.Data.totalPrice + (product.cartCount * product.newPrice);
            this.appService.Data.totalCartCount = this.appService.Data.totalCartCount + product.cartCount;
          });
        }

        this.auth.updateActiveState(res.data.active);
        this.auth.updateLoggedInStatus(true);
        this.snackBar.open('Welcome, You Account Has Been Verified Successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(['/']);
      } else {
        this.snackBar.open('Please Verify Again!', '×', { panelClass: 'danger', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(['/']);
      }
    })
  }

  ngOnInit() {
  }
}
