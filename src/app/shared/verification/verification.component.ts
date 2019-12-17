import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

  constructor(private auth: AuthenticationService, private route: ActivatedRoute, public router: Router, private snackBar: MatSnackBar) {
    let id = this.route.snapshot.queryParamMap.get('key')
    console.log(id);
    this.auth.verifyEmail(id).subscribe((res: any) => {
      if (res.message == 'Approved') {
        this.auth.user = res.data;
        this.snackBar.open('Welcome, You Account Has Been Verified Successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(['/']);
      } else {
        this.snackBar.open('Please Verify Again!', '×', { panelClass: 'danger', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(['/']);
      }
    })
  }

  ngOnInit() {
  }

}
