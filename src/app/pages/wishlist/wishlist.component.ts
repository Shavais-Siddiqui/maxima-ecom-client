import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Data, AppService } from '../../services/app.service';
import { Product } from '../../app.models';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  public quantity: number = 1;
  constructor(public appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.appService.Data.cartList.forEach(cartProduct => {
      this.appService.Data.wishList.forEach(product => {
        if (cartProduct._id == product._id) {
          product.cartCount = cartProduct.cartCount;
        }
      });
    });
  }

  public remove(product: Product) {
    const index: number = this.appService.Data.wishList.indexOf(product);
    if (index !== -1) {
      this.appService.Data.wishList.splice(index, 1);
      localStorage.setItem('wishList', JSON.stringify(this.appService.Data.wishList));
    }
  }

  public clear() {
    this.appService.Data.wishList.length = 0;
    localStorage.removeItem('wishList');
  }

  public getQuantity(val) {
    this.quantity = val.soldQuantity;
  }

  public addToCart(product: Product) {
    let currentProduct = this.appService.Data.cartList.filter(item => item._id == product._id)[0];
    if (currentProduct) {
      if ((currentProduct.cartCount + this.quantity) <= product.availibilityCount) {
        product.cartCount = currentProduct.cartCount + this.quantity;
      }
      else {
        this.snackBar.open('You can not add more items than available. In stock ' + product.availibilityCount + ' items and you already added ' + currentProduct.cartCount + ' item to your cart', '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
        return false;
      }
    }
    else {
      product.cartCount = this.quantity;
    }
    this.appService.addToCart(product);
  }

}