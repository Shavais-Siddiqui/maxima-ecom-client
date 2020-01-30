import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Data, AppService } from '../../services/app.service';
import { Product } from '../../app.models';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {
  @Input() product: Product;
  @Input() type: string;
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  public count: number = 1;
  public align = 'center center';
  public checkedProduct;
  constructor(public appService: AppService, public snackBar: MatSnackBar, public auth: AuthenticationService) {

  }

  ngOnInit() {
    if (this.product) {
      if (this.product.cartCount > 0) {
        this.count = this.product.cartCount;
      }
    }
    this.layoutAlign();
  }

  public layoutAlign() {
    if (this.type == 'all') {
      this.align = 'space-between center';
    }
    else if (this.type == 'wish') {
      this.align = 'start center';
    }
    else {
      this.align = 'center center';
    }
  }

  public increment(count) {
    if (!this.product.cartCount && this.count < this.product.availibilityCount) {
      // Item added without clicking on add to cart!
      this.count++;
    } else {
      if (this.count < this.product.availibilityCount) {
        this.count++;
        let obj = {
          productId: this.product._id,
          soldQuantity: this.count,
          total: this.count * this.product.newPrice
        }

        // Set local storage after increment // 
        this.auth.isLoggedIn.pipe(take(1)).subscribe(res => {
          if (res) {
            let cartList = [];
            // console.log(this.auth.user.cart, this.appService.Data.cartList)
            // if (this.appService.Data.cartList.length > 0) {
              cartList = this.appService.Data.cartList.map((x: any) => {
                if (x._id == this.product._id) {
                  x.cartCount = this.count;
                }
                return {
                  cartCount: x.cartCount,
                  productId: x._id
                }
              })
            // } else {
            //   cartList.push({
            //     cartCount: this.count,
            //     productId: this.product._id
            //   })
            //   this.auth.user.cart.push({
            //     cartCount: this.count,
            //     productId: this.product
            //   })
            // }
            this.auth.updateUser({
              cart: cartList
            }).subscribe(res => {
            })
          } else {
            let products = JSON.parse(localStorage.getItem('cartList'));
            if (products) {
              products.map(x => {
                if (x._id == this.product._id) {
                  x.cartCount = this.count;
                }
              })
              localStorage.setItem('cartList', JSON.stringify(products));
            }
          }
          this.changeQuantity(obj);
        })
      }
      else {
        this.snackBar.open('You can not choose more items than available. In stock ' + this.count + ' items.', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }

  public decrement(count) {
    if (this.count > 1) {
      this.count--;
      let obj = {
        productId: this.product._id,
        soldQuantity: this.count,
        total: this.count * this.product.newPrice
      }

      this.auth.isLoggedIn.pipe(take(1)).subscribe(res => {
        if (res) {
          let cartList = this.auth.user.cart.map(x => {
            if (x.productId._id == this.product._id) {
              x.cartCount = this.count;
            }
            return {
              cartCount: x.cartCount,
              productId: x.productId._id
            }
          })
          this.auth.updateUser({
            cart: cartList
          }).subscribe(res => {
          })
        } else {
          let products = JSON.parse(localStorage.getItem('cartList'));
          if (products) {
            products.map(x => {
              if (x._id == this.product._id) {
                x.cartCount = this.count;
              }
            })
            localStorage.setItem('cartList', JSON.stringify(products));
          }
        }
        this.changeQuantity(obj);
      })
    }
  }

  public addToCompare(product: Product) {
    this.appService.addToCompare(product);
  }

  public addToWishList(product: Product) {
    let currentProduct = this.appService.Data.cartList.filter(item => item._id == product._id)[0];
    if (currentProduct) {
      return this.snackBar.open('This product present in your cart.', '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
    }
    this.appService.addToWishList(product);
  }

  public addToCart(product: Product) {
    let currentProduct = this.appService.Data.cartList.filter(item => item._id == product._id)[0];
    if (currentProduct) {
      if (currentProduct.cartCount > 0) {
        return this.snackBar.open('You already added this item in the cart.', '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
      }
      if ((currentProduct.cartCount + this.count) <= this.product.availibilityCount) {
        product.cartCount = currentProduct.cartCount + this.count;
      }
      else {
        return this.snackBar.open('You can not add more items than available. In stock ' + this.product.availibilityCount + ' items and you already added ' + currentProduct.cartCount + ' item to your cart', '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
      }
    }
    else {
      product.cartCount = this.count;
    }
    this.appService.addToCart(product);
  }

  public openProductDialog(event) {
    this.onOpenProductDialog.emit(event);
  }

  public changeQuantity(value) {
    this.onQuantityChange.emit(value);
  }

}