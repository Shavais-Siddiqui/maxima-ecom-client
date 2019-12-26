import { Component, ViewEncapsulation, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { Data, AppService } from '../../../services/app.service';
import { Product } from '../../../app.models';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDialogComponent implements OnInit {
  public config: SwiperConfigInterface = {};
  total = [];
  grandTotal = 0;
  cartItemCount = [];
  cartItemCountTotal = 0;
  constructor(public appService: AppService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Product) {
    let localProducts = JSON.parse(localStorage.getItem('cartList'));
    if (localProducts) {
      let products = localProducts.filter(x => {
        return x.id == this.product.id
      })
      if (products.length > 0) {
        console.log(products)
        this.product = products[0]
      }
    }
  }

  ngOnInit() {
    this.appService.Data.cartList.forEach(product => {
      this.total[product.id] = product.cartCount * product.newPrice;
      this.grandTotal += product.cartCount * product.newPrice;
      this.cartItemCount[product.id] = product.cartCount;
      this.cartItemCountTotal += product.cartCount;
    })
  }

  ngAfterViewInit() {
    this.config = {
      slidesPerView: 1,
      spaceBetween: 0,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      effect: "fade",
      fadeEffect: {
        crossFade: true
      }
    }
  }
  // productId: this.product.id,
  // soldQuantity: this.count,
  // total: this.count * this.product.newPrice

  public updateCart(value) {
    console.log('inc', value)
    if (value) {
      this.total[value.productId] = value.total;
      this.cartItemCount[value.productId] = value.soldQuantity;
      this.grandTotal = 0;
      this.total.forEach(price => {
        this.grandTotal += price;
      });
      this.cartItemCountTotal = 0;
      this.cartItemCount.forEach(count => {
        this.cartItemCountTotal += count;
      });

      this.appService.Data.totalPrice = this.grandTotal;
      this.appService.Data.totalCartCount = this.cartItemCountTotal;

      this.appService.Data.cartList.forEach(product => {
        this.cartItemCount.forEach((count, index) => {
          if (product.id == index) {
            product.cartCount = count;
          }
        });
      });
      let products = JSON.parse(localStorage.getItem('cartList'));
      if (products) {
        products.map(x => {
          console.log('Hello world', x)
        })
      }
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}