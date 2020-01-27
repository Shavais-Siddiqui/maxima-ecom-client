import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Settings, AppSettings } from '../app.settings';
import { AppService } from '../services/app.service';
import { Category, Product } from '../app.models';
import { SidenavMenuService } from '../theme/components/sidenav-menu/sidenav-menu.service';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  providers: [SidenavMenuService]
})
export class PagesComponent implements OnInit {
  public showBackToTop: boolean = false;
  public categories: Category[];
  public category: Category;
  public sidenavMenuItems: Array<any>;
  userActiveStatus = true;
  @ViewChild('sidenav', { static: false }) sidenav: any;

  public settings: Settings;
  constructor(public appSettings: AppSettings,
    public appService: AppService,
    public sidenavMenuService: SidenavMenuService,
    public router: Router,
    public auth: AuthenticationService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.auth.isUserActive.subscribe((res: any) => {
      this.userActiveStatus = res;
    })
    this.auth.isLoggedIn.pipe(take(1)).subscribe(res => {
      let cartList;
      if (res) {
        this.auth.getUserData().subscribe((res: any) => {
          this.auth.user = res.data;
          this.auth.userstatusSubject.next(res.data.active)
          cartList = this.auth.user.cart.map(x => {
            x.productId.cartCount = x.cartCount;
            return x.productId
          })
          if (cartList) {
            this.appService.Data.cartList = cartList;
            cartList.forEach(product => {
              this.appService.Data.totalPrice = this.appService.Data.totalPrice + (product.cartCount * product.newPrice);
              this.appService.Data.totalCartCount = this.appService.Data.totalCartCount + product.cartCount;
            });
          }
        })
      } else {
        cartList = JSON.parse(localStorage.getItem('cartList'));
        if (cartList) {
          this.appService.Data.cartList = cartList;
          cartList.forEach(product => {
            this.appService.Data.totalPrice = this.appService.Data.totalPrice + (product.cartCount * product.newPrice);
            this.appService.Data.totalCartCount = this.appService.Data.totalCartCount + product.cartCount;
          });
        }
      }
    })

    let wishList = JSON.parse(localStorage.getItem('wishList'))
    if (wishList) {
      this.appService.Data.wishList = wishList;
    }
    this.getCategories();
    this.sidenavMenuItems = this.sidenavMenuService.getSidenavMenuItems();
  }

  public getCategories() {
    this.appService.getCategories().subscribe((res: any) => {
      this.categories = res.data;
      this.category = res.data[0];
    })
  }

  public changeCategory(event) {
    if (event.target) {
      this.category = this.categories.filter(category => category.name == event.target.innerText)[0];
    }
    if (window.innerWidth < 960) {
      this.stopClickPropagate(event);
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
          this.appService.Data.totalPrice = this.appService.Data.totalPrice - product.newPrice * product.cartCount;
          this.appService.Data.totalCartCount = this.appService.Data.totalCartCount - product.cartCount;
          this.appService.resetProductCartCount(product);
        } else {
          localStorage.setItem('cartList', JSON.stringify(this.appService.Data.cartList));
          this.appService.Data.totalPrice = this.appService.Data.totalPrice - product.newPrice * product.cartCount;
          this.appService.Data.totalCartCount = this.appService.Data.totalCartCount - product.cartCount;
          this.appService.resetProductCartCount(product);
        }
      })
    }
  }

  public clear() {
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


  public changeTheme(theme) {
    this.settings.theme = theme;
  }

  public stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  public search() { }


  public scrollToTop() {
    var scrollDuration = 200;
    var scrollStep = -window.pageYOffset / (scrollDuration / 20);
    var scrollInterval = setInterval(() => {
      if (window.pageYOffset != 0) {
        window.scrollBy(0, scrollStep);
      }
      else {
        clearInterval(scrollInterval);
      }
    }, 10);
    if (window.innerWidth <= 768) {
      setTimeout(() => { window.scrollTo(0, 0) });
    }
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    ($event.target.documentElement.scrollTop > 300) ? this.showBackToTop = true : this.showBackToTop = false;
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.sidenav.close();
      }
    });
    this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
  }

  public closeSubMenus() {
    if (window.innerWidth < 960) {
      this.sidenavMenuService.closeAllSubMenus();
    }
  }
}