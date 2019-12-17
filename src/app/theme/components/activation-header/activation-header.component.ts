import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-activation-header',
  templateUrl: './activation-header.component.html',
  styleUrls: ['./activation-header.component.scss']
})
export class ActivationHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  resendMail() {
    console.log('Hello')
  }

}
