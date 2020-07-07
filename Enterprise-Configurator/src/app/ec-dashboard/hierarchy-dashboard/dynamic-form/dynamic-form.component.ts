import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() question;
  @Input() form: FormGroup;

  constructor() { }

  ngOnInit() {
    console.log("Form fields:----",this.question)
    console.log("Form fields:----",this.form)
    /* if(JSON.parse(localStorage.getItem('dynamicForms')) ){
      this.form.setValue( JSON.parse(localStorage.getItem('dynamicForms')));
    } */
  }

}
