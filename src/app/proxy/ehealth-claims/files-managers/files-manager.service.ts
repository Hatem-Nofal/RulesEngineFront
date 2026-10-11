import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { AttachmentDto } from '../view-models/models';

@Injectable({
  providedIn: 'root',
})
export class FilesManagerService {
  apiName = 'Default';
  

  downloadAttachmentByAttachmentId = (attachmentId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: '/api/FilesManager/DownloadAttachment',
      params: { attachmentId },
    },
    { apiName: this.apiName,...config });
  

  downloadLatestLog = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: '/api/FilesManager/DownloadLatestLog',
    },
    { apiName: this.apiName,...config });
  

  getBeneficiaryAttachmentsByBeneficiaryId = (beneficiaryId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AttachmentDto[]>({
      method: 'GET',
      url: `/api/app/files-manager/beneficiaries/${beneficiaryId}/attachments`,
    },
    { apiName: this.apiName,...config });
  

  getExcelECMBatchebyIdByBatcheId = (batcheId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: `/api/app/files-manager/excel-eCMBatcheby-id/${batcheId}`,
    },
    { apiName: this.apiName,...config });
  

  getPdfECMBatchebyIdByBatcheId = (batcheId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: `/api/app/files-manager/pdf-eCMBatcheby-id/${batcheId}`,
    },
    { apiName: this.apiName,...config });
  

  getPdfbyIdByClaimId = (ClaimId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: `/api/app/files-manager/pdfby-id/${ClaimId}`,
    },
    { apiName: this.apiName,...config });
  

  uploadBeneficiaryAttachmentByBeneficiaryIdAndFile = (beneficiaryId: number, file: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: `/api/app/files-manager/beneficiaries/${beneficiaryId}/attachments`,
      body: file,
    },
    { apiName: this.apiName,...config });
  

  uploadFileByFile = (file: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/FilesManager/UploadAttachments',
      body: file,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
