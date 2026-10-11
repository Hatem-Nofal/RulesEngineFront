import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExcelGeneratorAppSeviceService {
  apiName = 'Default';
  

  generateBachesExcel = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: '/api/app/excel-generator-app-sevice/generate-baches-excel',
    },
    { apiName: this.apiName,...config });
  

  generateExcel = (batchId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: `/api/app/excel-generator-app-sevice/generate-excel/${batchId}`,
    },
    { apiName: this.apiName,...config });
  

  generateExcelwithDescByBatchCode = (batchCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: '/api/app/excel-generator-app-sevice/generate-excelwith-desc',
      params: { batchCode },
    },
    { apiName: this.apiName,...config });
  

  generateIPExcel = (batchId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: `/api/app/excel-generator-app-sevice/generate-iPExcel/${batchId}`,
    },
    { apiName: this.apiName,...config });
  

  generateOPExcel = (batchId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: `/api/app/excel-generator-app-sevice/generate-oPExcel/${batchId}`,
    },
    { apiName: this.apiName,...config });
  

  generateReconciliationExcel = (batchId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: `/api/app/excel-generator-app-sevice/generate-reconciliation-excel/${batchId}`,
    },
    { apiName: this.apiName,...config });
  

  getExcelECMBatchebyIdByBatcheId = (batcheId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: `/api/app/excel-generator-app-sevice/excel-eCMBatcheby-id/${batcheId}`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
