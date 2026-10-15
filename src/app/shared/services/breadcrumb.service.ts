import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/breadcrumb.model';
import { LocalizationService } from '@abp/ng.core'; // ← add

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localization: LocalizationService // ← add
  ) {
    this.breadcrumbs = this.createBreadcrumbs(activatedRoute.root);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });
  }

private createBreadcrumbs(
  route: ActivatedRoute,
  url: string = '',
  breadcrumbs: Breadcrumb[] = []
): Breadcrumb[] {
  // Handle root case
  if (this.router.url === '/' || this.router.url === '') {
    return [{
      label: this.localization.instant('::Menu:HomePage'),
      url: '/',
      navigate: true
    }];
  }

  const children = route.children;
  if (children.length === 0) return breadcrumbs;

  for (const child of children) {
    const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
    if (routeURL !== '') {
      url += `/${routeURL}`;
    }

    const breadcrumbData = child.snapshot.data['breadcrumb'];

    if (breadcrumbData) {
      let labelKey: string;

      // ✅ Support both string and function breadcrumb definitions
      if (typeof breadcrumbData === 'function') {
        labelKey = breadcrumbData(child.snapshot);
      } else {
        labelKey = breadcrumbData;
      }

      // Localize the final string
      const label = this.localization.instant(labelKey);

      breadcrumbs.push({
        label,
        url,
        navigate: child.snapshot.data['navigate']
      });
    }

    // Recurse deeper
    return this.createBreadcrumbs(child, url, breadcrumbs);
  }

  return breadcrumbs;
}
}
