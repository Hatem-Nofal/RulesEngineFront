import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { DiagnosisDto } from './diagnosis/models';
import type { MedicalActivityDto, MedicalActivityWithAuditDto } from './medical-activities/models';
import type { ClaimsLoggingDto } from './claims-loggings/models';
import type { PatientIdFlag } from '../../common/enums/patient-id-flag.enum';

export interface ClaimDto extends EntityDto<number> {
  number?: string;
  serial: number;
  patient_nid?: string;
  facilityCode?: string;
  ehealth_Batch_code?: string;
  uhia_Batch_code?: string;
  page_Count?: number;
  visit_Start_Date?: string;
  visit_End_Date?: string;
  create_timestamp?: string;
  update_timestamp?: string;
  start_Service_id?: number;
  end_Service_id?: number;
  scan_Date?: string;
  batch_id: number;
  entered_Net?: number;
  paymentStatus_id?: number;
  status_id: number;
  medicalDiagnosis: DiagnosisDto[];
  medicalActivities: MedicalActivityDto[];
  claimsTags: number[];
  claimsLoggings: ClaimsLoggingDto[];
  createdBy_Id?: string;
  firstUpdate_timestamp?: string;
  firstModifiedBy_Id?: string;
  assignedTo_Id?: string;
  modifiedBy_Id?: string;
  patient_nid_orig?: string;
  handle_id?: string;
  nid_Valid_Flag?: PatientIdFlag;
  total_Gross?: number;
  total_Net?: number;
  total_patient_share?: number;
  audit_Rej_Amt?: number;
  audit_Appr_Amt?: number;
  encounterStartTypeId?: number;
  encounterStartTypeName?: string;
  encounterEndTypeName?: string;
  encounterEndTypeId?: number;
  mod_flag?: string;
  diagnosis_id?: number;
  modifiedBy?: string;
  serviceType?: string;
  serviceTypeId?: number;
  providerName?: string;
  service_Date?: string;
  physicianId: number;
  total_Approved?: number;
  total_Rejected?: number;
  batchStatusId?: number;
  concurrencyStamp?: string;
}

export interface ClaimListDto extends EntityDto<number> {
  number?: string;
  ehealth_Batch_code?: string;
  serial: number;
  patient_nid?: string;
  page_Count?: number;
  visit_Start_Date?: string;
  visit_End_Date?: string;
  start_Service_id?: number;
  scan_Date?: string;
  end_Service_id?: number;
  batch_id: number;
  batch_name?: string;
  entered_Net?: number;
  paymentStatus_id?: number;
  status_id: number;
  status_name?: string;
  patient_nid_orig?: string;
  handle_id?: string;
  modifiedBy?: string;
  modifiedOn?: string;
  nid_Valid_Flag?: PatientIdFlag;
  total_Gross?: number;
  total_Net?: number;
  total_patient_share?: number;
  audit_Rej_Amt?: number;
  audit_Appr_Amt?: number;
  encounterStartTypeId?: number;
  encounterEndTypeId?: number;
  batchStatusId?: number;
}

export interface ClaimPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  number?: string;
  patient_nid?: string;
  batch_name?: string;
  batch_id?: number;
  firstUpdate_timestamp?: string;
}

export interface ClaimWithAuditDto extends EntityDto<number> {
  number?: string;
  serial: number;
  patient_nid?: string;
  ehealth_Batch_code?: string;
  uhia_Batch_code?: string;
  page_Count?: number;
  visit_Start_Date?: string;
  visit_End_Date?: string;
  create_timestamp?: string;
  update_timestamp?: string;
  start_Service_id?: number;
  end_Service_id?: number;
  scan_Date?: string;
  batch_id: number;
  entered_Net?: number;
  paymentStatus_id?: number;
  status_id: number;
  medicalDiagnosis: DiagnosisDto[];
  medicalActivities: MedicalActivityWithAuditDto[];
  claimsTags: number[];
  claimsLoggings: ClaimsLoggingDto[];
  createdBy_Id?: string;
  firstUpdate_timestamp?: string;
  firstModifiedBy_Id?: string;
  assignedTo_Id?: string;
  modifiedBy_Id?: string;
  patient_nid_orig?: string;
  handle_id?: string;
  nid_Valid_Flag?: PatientIdFlag;
  total_Gross?: number;
  total_Net?: number;
  total_Approved?: number;
  total_Rejected?: number;
  total_patient_share?: number;
  audit_Rej_Amt?: number;
  audit_Appr_Amt?: number;
  encounterStartTypeId?: number;
  encounterEndTypeId?: number;
  encounterStartTypeName?: string;
  encounterEndTypeName?: string;
  mod_flag?: string;
  diagnosis_id?: number;
  modifiedBy?: string;
  serviceType?: string;
  serviceTypeId?: number;
  providerName?: string;
  service_Date?: string;
  physicianId: number;
  batchStatusId?: number;
}

export interface EditClaimDto extends EntityDto<number> {
  encounterId?: string;
  patientNid?: string;
  visitStartDate?: string;
  visitEndDate?: string;
  physicianId: number;
  isDraft: boolean;
  medicalDiagnosis: EditDiagnosisDto[];
  medicalActivities: EditMedicalActivityDto[];
  claimsTags: number[];
  concurrencyStamp?: string;
}

export interface EditDiagnosisDto extends EntityDto<number> {
  diagnosisId: number;
  diagnosisType?: string;
  isDeleted: boolean;
}

export interface EditMedicalActivityDto extends EntityDto<number> {
  quantity?: number;
  gross?: number;
  net?: number;
  patientShare?: number;
  startTime?: string;
  activityTypeId?: number;
  subTypeId?: number;
  isDeleted: boolean;
  activityTags: number[];
}
