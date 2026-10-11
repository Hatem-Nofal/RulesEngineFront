import { Component, effect, EffectRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Popover } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { AppLocalizationService } from 'src/app/shared/services/localization/app-localization.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LayoutService } from '../../services/layout.service';
import { ServerConnectSignalService } from '../../services/serverconnect-signal.service';
import { Options } from '@popperjs/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnDestroy {
  @ViewChild('op') op!: Popover;
  isSidebarOpen: boolean = true;
  isSmallScreen!:boolean
  profile: any = {};
  selectedMember: any = '';
  languages: any[] = ['ar', 'en'];
  isLogged: any;
  /**
   *
   */
  serverConnectedSignalEffectRef!: EffectRef;

  isServerConnected: boolean = true;
  
  private pingSubscription: Subscription;
  constructor(
    private appLocalizationService: AppLocalizationService,
    private layoutService: LayoutService,
    private router: Router,
    private _serverConnectSignalService: ServerConnectSignalService,
    private _AuthenticationService: AuthenticationService
  ) {
    this.getProfile();
    this.appLocalizationService.newLangVar.subscribe(res => (this.selectedMember = res));
    this.signalR();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 576; 
  }

  getProfile() {
    this._AuthenticationService.getUData();
    this._AuthenticationService.uProfileVar.subscribe(value => {
      return (this.profile = value);
    });
  }

  toggleLanguage() {
    const nextLang = this.selectedMember === 'en' ? 'ar' : 'en';
    this.localizationChange(nextLang);
  }

  localizationChange(lang: string) {
    if (lang === 'en' || lang === 'ar') {
      this.selectedMember = lang;
      this.appLocalizationService.onLocalizationChange(lang);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.layoutService.toggleSidebar();
  }
  changeTheme(event) {
    const icon = document.getElementById('theme-icon');

    if (event.target.checked) {
      this.layoutService.changeTheme('light');
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-fill');
    } else {
      this.layoutService.changeTheme('dark');
      icon.classList.remove('bi-moon-fill');
      icon.classList.add('bi-sun-fill');
    }
  }
  logout() {
    this.appLocalizationService.authLogout().subscribe({
      next: resposne => {
        if (localStorage.getItem('access_token') === null) {
          this.router.navigate(['/account/login']);
        }
      },
      error: error => {},
      complete: () => {
        this.appLocalizationService.isAuthenticatedFn();
      },
    });
  }

  signalR() {
    this.serverConnectedSignalEffectRef = effect(
      () => {
        const serverConnect = this._serverConnectSignalService.ServerConnect();
        this.isServerConnected = serverConnect;
      },
      { manualCleanup: true }
    );
  }
  	popperUserOptions = (options: Partial<Options>) => {
		options.placement = 'bottom';

		for (const modifier of options.modifiers || []) {
			if (modifier.name === 'flip') {
				modifier.enabled = false;
			}

			if (modifier.name === 'offset' && modifier.options) {
				modifier.options.offset = () => [5, 5];
			}
		}

		options.modifiers?.push({
			name: 'custom',
			enabled: true,
			phase: 'main',
			fn: ({ state }) => { },
		});

		options.onFirstUpdate = (state) => {
			if (state.elements?.arrow) {
				state.elements.arrow.style.display = 'none';
			}
		};

		return options;
	};

	popperLocalOptions = (options: Partial<Options>) => {
		options.placement = 'bottom';

		for (const modifier of options.modifiers || []) {
			if (modifier.name === 'flip') {
				modifier.enabled = false;
			}

			if (modifier.name === 'offset' && modifier.options) {
				modifier.options.offset = () => [-5, 5];
			}
		}


		options.modifiers?.push({
			name: 'custom',
			enabled: true,
			phase: 'main',
			fn: ({ state }) => { },
		});

		options.onFirstUpdate = (state) => {
			if (state.elements?.arrow) {
				state.elements.arrow.style.display = 'none';
			}
		};

		return options;
	};


  ngOnDestroy(): void {
    this.serverConnectedSignalEffectRef.destroy();
  }
}
