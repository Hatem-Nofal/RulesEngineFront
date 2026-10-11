import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { LocalizationModule } from '@abp/ng.core'; // ← add this

@Component({
  selector: 'app-forms-error',
  standalone: true,
  imports: [
    LocalizationModule, // ← add this
  ],
  templateUrl: './forms-error.component.html',
  styleUrl: './forms-error.component.scss'
})
export class FormsErrorComponent implements OnChanges {
  @Input() control: AbstractControl | null = null;
  @Input() message: null | string = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}
}