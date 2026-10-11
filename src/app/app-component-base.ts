import { Injector } from '@angular/core';
import { PrimengTableHelper } from 'src/assets/config/primeng-table-helper';

export abstract class AppComponentBase {
  primengTableHelper: PrimengTableHelper;

  constructor(injector: Injector) {
    this.primengTableHelper = new PrimengTableHelper();
  }

}
