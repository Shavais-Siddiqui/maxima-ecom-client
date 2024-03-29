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
  total = {};
  grandTotal = 0;
  cartItemCount = {};
  cartItemCountTotal = 0;
  constructor(public appService: AppService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Product) {

    let products = this.appService.Data.cartList.filter(x => x._id == this.product._id)
    if (products.length > 0) {
      this.product = products[0]
    }
  }

  ngOnInit() {
    this.appService.Data.cartList.forEach(product => {
      let id = Number(product._id);
      this.total[product._id] = product.cartCount * product.newPrice;
      this.grandTotal += product.cartCount * product.newPrice;
      this.cartItemCount[product._id] = product.cartCount;
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

  public close(): void {
    this.dialogRef.close();
  }
}