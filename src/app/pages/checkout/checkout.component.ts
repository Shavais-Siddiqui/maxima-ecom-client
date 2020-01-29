import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Data, AppService } from '../../services/app.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {
  @ViewChild('horizontalStepper', { static: false }) horizontalStepper: MatStepper;
  @ViewChild('verticalStepper', { static: false }) verticalStepper: MatStepper;
  billingForm: FormGroup;
  deliveryForm: FormGroup;
  paymentForm: FormGroup;
  countries = [];
  months = [];
  years = [];
  deliveryMethods = [];
  grandTotal = 0;
  provinces;
  cities;
  provinceSelected = true;
  filteredCities;

  constructor(public appService: AppService, public formBuilder: FormBuilder) {
    // this.billingForm.get('city').disable();
  }
  filteredOptions: Observable<any[]>;
  ngOnInit() {
    this.appService.Data.cartList.forEach(product => {
      this.grandTotal += product.cartCount * product.newPrice;
    });
    this.countries = this.appService.getCountries();
    this.months = this.appService.getMonths();
    this.years = this.appService.getYears();
    this.deliveryMethods = this.appService.getDeliveryMethods();
    this.billingForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      city: [{ value: '', disabled: true }, Validators.required],
      state: '',
      address: ['', Validators.required]
    });
    this.deliveryForm = this.formBuilder.group({
      deliveryMethod: [this.deliveryMethods[0], Validators.required]
    });
    this.paymentForm = this.formBuilder.group({
      cardHolderName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiredMonth: ['', Validators.required],
      expiredYear: ['', Validators.required],
      cvv: ['', Validators.required]
    });
    this.appService.getProvinces().subscribe((res: any) => {
      this.provinces = res.data;
    })
    this.onChanges();
    // this.filteredOptions = this.billingForm.controls['city'].valueChanges
    //   .pipe(
    //     startWith(""),
    //     map(value => {
    //       return this._filter(value)
    //     })
    //   );
  }
  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => {
      option.toLowerCase().includes(filterValue)
    }
    );
  }

  onChanges() {
    this.billingForm.controls['city'].valueChanges.subscribe(val => {
      if (val.length > 0) {
        const filterValue = val.toLowerCase();
        this.filteredCities = this.cities.filter(option => {
          return option.name.toLowerCase().includes(filterValue)
        })
      } else {
        this.filteredCities = this.cities;
      }
    })
  }

  public placeOrder() {
    this.horizontalStepper._steps.forEach(step => step.editable = false);
    this.verticalStepper._steps.forEach(step => step.editable = false);
    this.appService.Data.cartList.length = 0;
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;

  }

  change(event) {
    this.appService.getCities(event).subscribe((res: any) => {
      this.provinceSelected = false;
      this.cities = res.data;
      this.filteredCities = res.data;
      this.billingForm.get('city').enable()
    })
  }
}
