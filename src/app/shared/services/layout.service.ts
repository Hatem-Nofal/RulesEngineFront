import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isSidebarVisibleSignal = signal<boolean>(false);
  get isSidebarVisible() {
    return this.isSidebarVisibleSignal;
  }

  toggleSidebar() {
    this.isSidebarVisibleSignal.update(value => !this.isSidebarVisibleSignal());
  }

  changeTheme(theme: string) {
    if (theme === "light") {
      document.body.classList.add("light-theme")
      document.body.classList.remove("dark-theme")
    } else {
      document.body.classList.remove("light-theme")
      document.body.classList.add("dark-theme")
    }
  }

}