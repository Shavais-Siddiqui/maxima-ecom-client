import { ErrorHandler, Injector } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) { }
    handleError(error: Error | HttpErrorResponse) {

        const errorService = this.injector.get(ErrorService);
        const notifier = this.injector.get(NotificationService);

        let message;
        let stackTrace;

        // your custom error handling logic    
        if (error instanceof HttpErrorResponse) {
            // Server Error
            message = errorService.getServerMessage(error.error);
            // stackTrace = errorService.getServerStack(error);
            notifier.showError(message);
        } else {
            // Client Error
            // message = errorService.getClientMessage(error);
            // stackTrace = errorService.getClientStack(error);
            // notifier.showError(message);
            if (!navigator.onLine) {
                // return 'No Internet Connection';
                notifier.showError('No Internet Connection');
            }
        }
    }
}