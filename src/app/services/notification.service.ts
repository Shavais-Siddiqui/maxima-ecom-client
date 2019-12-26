import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(public snackBar: MatSnackBar, private zone: NgZone) { }

  showSuccess(message: string): void {
    this.snackBar.open(message, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
  }

  showError(message: string): void {
    // The second parameter is the text in the button. 
    // In the third, we send in the css class for the snack bar.
    this.zone.run(() => {
    this.snackBar.open(message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    })
  }
}
