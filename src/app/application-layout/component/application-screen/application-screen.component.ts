import { Component, computed, OnInit } from '@angular/core';
import { combinedSlideAnimation } from 'src/app/shared/animation/animation';
import { LayoutService } from 'src/app/shared/services/layout.service';

@Component({
  selector: 'app-application-screen',
  templateUrl: './application-screen.component.html',
  styleUrls: ['./application-screen.component.scss'],
  animations: [combinedSlideAnimation],
  standalone: false
})
export class ApplicationScreenComponent implements OnInit {
  isSidebarCollapsed = computed(() => this.layoutService.isSidebarVisible());
  start = '100%';
  end = '-100%';
  constructor(private layoutService: LayoutService) { }

  ngOnInit() {
    const dir = document.documentElement.getAttribute('dir');
    if (dir === 'rtl') {
      this.start = '-100%';
      this.end = '100%';
    }
  }

}
