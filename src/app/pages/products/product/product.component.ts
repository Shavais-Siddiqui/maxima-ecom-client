import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Data, AppService } from '../../../services/app.service';
import { Product } from "../../../app.models";
import { ProductZoomComponent } from './product-zoom/product-zoom.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [NgbRatingConfig]
})
export class ProductComponent implements OnInit {
  @ViewChild('zoomViewer', { static: false }) zoomViewer;
  @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;
  public sConfig: SwiperConfigInterface = {};
  public product: Product;
  public image: any;
  public zoomImage: any;
  private sub: any;
  public form: FormGroup;
  public relatedProducts: Array<Product>;

  total = {};
  grandTotal = 0;
  cartItemCount = {};
  cartItemCountTotal = 0;
  productId;
  rates;
  readonly = true;
  constructor(public appService: AppService, private activatedRoute: ActivatedRoute, public dialog: MatDialog, public formBuilder: FormBuilder, public auth: AuthenticationService, public snackBar: MatSnackBar, config: NgbRatingConfig) {
    config.max = 5;
    config.readonly = false;
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.productId = params['id'];
      this.getProductById(params['id']);
    });
    this.form = this.formBuilder.group({
      'review': [null, Validators.required],
      'rate': [null, Validators.required]
    });
    this.getRelatedProducts();
  }

  ngAfterViewInit() {
    this.sConfig = {
      observer: false,
      slidesPerView: 4,
      spaceBetween: 10,
      keyboard: true,
      navigation: true,
      pagination: false,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3,
        }
      }
    }
  }

  public getProductById(id) {
    this.appService.getProductById(id).subscribe((res: any) => {
      this.product = res.data;
      let localProducts = JSON.parse(localStorage.getItem('cartList'));
      if (localProducts) {
        let products = localProducts.filter(x => {
          return x._id == res.data._id
        })
        if (products.length > 0) {
          this.product.cartCount = products[0].cartCount;
        }
      }
      this.image = res.data.images[0].medium;
      this.zoomImage = res.data.images[0].large;
      setTimeout(() => {
        this.sConfig.observer = true;
        // this.directiveRef.setIndex(0);
      });
    });
  }

  public getRelatedProducts() {
    this.appService.getProducts('related').subscribe((res: any) => {
      this.relatedProducts = res.data;
    })
  }

  public selectImage(image) {
    this.image = image.medium;
    this.zoomImage = image.large;
  }

  public onMouseMove(e) {
    if (window.innerWidth >= 1280) {
      var image, offsetX, offsetY, x, y, zoomer;
      image = e.currentTarget;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      x = offsetX / image.offsetWidth * 100;
      y = offsetY / image.offsetHeight * 100;
      zoomer = this.zoomViewer.nativeElement.children[0];
      if (zoomer) {
        zoomer.style.backgroundPosition = x + '% ' + y + '%';
        zoomer.style.display = "block";
        zoomer.style.height = image.height + 'px';
        zoomer.style.width = image.width + 'px';
      }
    }
  }

  public onMouseLeave(event) {
    this.zoomViewer.nativeElement.children[0].style.display = "none";
  }

  public openZoomViewer() {
    this.dialog.open(ProductZoomComponent, {
      data: this.zoomImage,
      panelClass: 'zoom-dialog'
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public onSubmitReview(): void {
    if (this.form.valid) {
      this.auth.isLoggedIn.subscribe(res => {
        if (res) {
          // Add Review
          let data = {
            userId: this.auth.user._id,
            userName: this.auth.user.name,
            productId: this.productId,
            rate: this.form.get('rate').value,
            reviewText: this.form.get('review').value
          };
          this.appService.addReview(data).subscribe((res: any) => {
            this.snackBar.open('Thanks For Your Review', '×', { panelClass: 'success', verticalPosition: 'top', duration: 5000 });
          })
        } else {
          this.snackBar.open('Please Login To Continue', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      })
    } else {
      this.snackBar.open('Please Fill The Details', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    }
  }

  rateCount(rate) {
    this.rates = rate;
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
      // let products = JSON.parse(localStorage.getItem('cartList'));
      // if (products) {
      //   products.map(x => {
      //     console.log('Hello world', x)
      //   })
      // }
    }
  }
}