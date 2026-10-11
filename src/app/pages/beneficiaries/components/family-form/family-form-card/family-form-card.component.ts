import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-family-form-card',
  templateUrl: './family-form-card.component.html',
  styleUrl: './family-form-card.component.scss'
})
export class FamilyFormCardComponent {
  @Input() header!: string;
  @Input() color!: string;
  @Input() items: { icon: string; title: string; value: string }[] = [];
}
