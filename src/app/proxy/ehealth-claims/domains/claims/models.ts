
export interface BatchValidationJobStatusDto {
  jobId?: string;
  batchId: number;
  status?: string;
  totalClaims: number;
  processedClaims: number;
  insertedResults: number;
  batchCode?: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ClaimActivityRequestDto {
  activityId: number;
  systemCode?: string;
  gross?: number;
  net?: number;
  mediumDesc?: string;
  patient_share?: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;
  quantity?: number;
  tags: string[];
  activityCode?: string;
}

export interface ClaimDto {
  id: number;
  patientId?: string;
  diagnoses: DiagnosisDto[];
  currentMedications: MedicationDto[];
  procedures: ProcedureDto[];
  consumables: ConsumableDto[];
  drugQuantities: DrugQuantityDto[];
}

export interface ClaimParamsByCodeModel {
  workflows: number[];
  jsonPayload: object;
}

export interface ClaimParamsByCodeModelExtended {
  workflows: number[];
  workflownames: string[];
  claimValidationRequests: ClaimValidationByCodeRequestExtended[];
}

export interface ClaimParamsModel {
  workflows: number[];
  claimValidationRequests: ClaimValidationRequest[];
  jsonPayload: object;
}

export interface ClaimValidationByCodeRequestExtended {
  activityId: number;
  patientnid?: string;
  patientAge?: number;
  diagnosisCodes: string[];
  activityCodes: string[];
  claimedNet?: number;
  enteredNet?: number;
  claimedGross?: number;
  enteredGross?: number;
  claimStartDate?: string;
  claimEndDate?: string;
  batchType?: string;
  batchServiceMonth?: number;
  batchServiceYear?: number;
  claimTags: string[];
  claimNumber?: string;
  activities: ClaimActivityRequestDto[];
}

export interface ClaimValidationRequest {
  patientId?: string;
  patientAge?: number;
  patientnid?: string;
  patientGender?: string;
  diagnoses: string[];
  currentMedications: string[];
  procedures: string[];
  consumables: string[];
  drugQuantityByCode: Record<string, number>;
  diagnosisIds: number[];
  activityTypeIds: number[];
  diagnosisCounts: Record<string, number>;
  medicationCounts: Record<string, number>;
  medicationQuantities: Record<string, number>;
  activityQuantitiesByTypeId: Record<number, number>;
}

export interface ClaimValidationResponse {
  success?: string;
  failed: ClaimValidationResultDto[];
}

export interface ClaimValidationResultDto {
  activityId: number;
  patientId?: string;
  rejection: boolean;
  workFlowName?: string;
  rule?: string;
  errorMessage?: string;
  errorType?: string;
  claimNumber?: string;
  matchedActivityCodes: string[];
  claim: ClaimDto;
  normalizedWorkFlowName?: string;
}

export interface ConsumableDto {
  id: number;
  name?: string;
  claimValidationId: number;
}

export interface DiagnosisDto {
  id: number;
  code?: string;
  claimValidationId: number;
}

export interface DrugQuantityDto {
  id: number;
  drugName?: string;
  quantity: number;
  claimValidationId: number;
}

export interface MedicationDto {
  id: number;
  name?: string;
  claimValidationId: number;
}

export interface ProcedureDto {
  id: number;
  code?: string;
  claimValidationId: number;
}

export interface DiagnosisLookupDto {
  id: number;
  code?: string;
  description?: string;
}

export interface MedicationLookupDto {
  id: number;
  code?: string;
  description?: string;
  activityTypeId: number;
}

export interface BatchDropDownItemDto {
  id: number;
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
}

export interface BatchExportRequest {
  batchIds: number[];
}

export interface BatchesDropDownDto {
  items: BatchDropDownItemDto[];
  totalCount: number;
}

export interface ClaimDropDownItemDto {
  id: number;
  name?: string;
  number?: string;
}

export interface ClaimsDropDownDto {
  items: ClaimDropDownItemDto[];
  totalCount: number;
}

export interface SingleClaimValidationRequest {
  workflowIds: number[];
  claimId: number;
}
