/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InputSearchService } from './input-search.service';

describe('Service: InputSearch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputSearchService]
    });
  });

  it('should ...', inject([InputSearchService], (service: InputSearchService) => {
    expect(service).toBeTruthy();
  }));
});
