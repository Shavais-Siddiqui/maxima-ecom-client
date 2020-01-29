import { Injectable, EventEmitter } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { throwError } from 'rxjs';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(private spinner: NgxSpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `${token}`),
      });
    }
    this.spinner.show();
    const started = Date.now();

    return next.handle(req).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        this.spinner.hide();
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        this.spinner.hide();
        const elapsed = Date.now() - started;
        console.log(`Request for ${req.urlWithParams} failed after ${elapsed} ms.`);
        return throwError(err);
      }
    })
  }
}