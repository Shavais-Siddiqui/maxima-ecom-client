import { Component, OnInit } from '@angular/core';
import { Data, AppService } from '../../services/app.service';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  total = {};
  grandTotal = 0;
  cartItemCount = {};
  cartItemCountTotal = 0;
  constructor(public appService: AppService, public auth: AuthenticationService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.appService.Data.cartList.forEach((product: any) => {
        this.total[product._id] = product.cartCount * product.newPrice;
        this.grandTotal += product.cartCount * product.newPrice;
        this.cartItemCount[product._id] = product.cartCount;
        this.cartItemCountTotal += product.cartCount;
      })
      this.spinner.hide();
    }, 2000)
  }

  public updateCart(value) {
    if (value) {
      let id = Number(value.productId);
      this.total[value.productId] = value.total;
      this.cartItemCount[value.productId] = value.soldQuantity;
      this.grandTotal = 0;
      for (let i in this.total) {
        this.grandTotal += this.total[i];
      }
      this.cartItemCountTotal = 0;
      for (let i in this.cartItemCount) {
        this.cartItemCountTotal += this.cartItemCount[i];
      }

      this.appService.Data.totalPrice = this.grandTotal;
      this.appService.Data.totalCartCount = this.cartItemCountTotal;

      this.appService.Data.cartList.forEach(product => {
        for (let i in this.cartItemCount) {
          if (product._id == i) {
            product.cartCount = this.cartItemCount[i];
          }
        }
      });
    }
  }

  public remove(product) {
    const index: number = this.appService.Data.cartList.indexOf(product);
    if (index !== -1) {
      this.appService.Data.cartList.splice(index, 1);
      this.auth.isLoggedIn.pipe(take(1)).subscribe(res => {
        if (res) {
          let cartList = this.appService.Data.cartList.map(x => {
            return {
              cartCount: x.cartCount,
              productId: x._id
            }
          })
          this.auth.updateUser({
            cart: cartList
          }).subscribe(res => {
          })
        } else {
          localStorage.setItem('cartList', JSON.stringify(this.appService.Data.cartList));
        }
      })
      this.grandTotal = this.grandTotal - this.total[product._id];
      this.appService.Data.totalPrice = this.grandTotal;
      for (let i in this.total) {
        if (i == this.total[product._id]) {
          this.total[product._id] = 0;
        }
      }
      this.cartItemCountTotal = this.cartItemCountTotal - this.cartItemCount[product._id];
      this.appService.Data.totalCartCount = this.cartItemCountTotal;
      for (let i in this.cartItemCount) {
        if (i == this.cartItemCount[product._id]) {
          this.cartItemCount[product._id] = 0;
        }
      }
      this.appService.resetProductCartCount(product);
    }
  }

  public clear() {
    // localStorage.removeItem('cartList');
    // this.appService.Data.cartList.forEach(product => {
    //   this.appService.resetProductCartCount(product);
    // });
    // this.appService.Data.cartList.length = 0;
    // this.appService.Data.totalPrice = 0;
    // this.appService.Data.totalCartCount = 0;
    this.auth.isLoggedIn.pipe(take(1)).subscribe(res => {
      if (res) {
        this.auth.updateUser({
          cart: []
        }).subscribe(res => {
        })
        this.appService.Data.cartList.forEach(product => {
          this.appService.resetProductCartCount(product);
        });
        this.appService.Data.cartList.length = 0;
        this.appService.Data.totalPrice = 0;
        this.appService.Data.totalCartCount = 0;
      } else {
        localStorage.removeItem('cartList');
        this.appService.Data.cartList.forEach(product => {
          this.appService.resetProductCartCount(product);
        });
        this.appService.Data.cartList.length = 0;
        this.appService.Data.totalPrice = 0;
        this.appService.Data.totalCartCount = 0;
      }
    })
  }

}
