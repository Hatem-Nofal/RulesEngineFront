
export interface ClaimActivityRequestDto {
  activityId?: number;
  systemCode?: string | null;
  gross?: number | null;
  net?: number | null;
  mediumDesc?: string | null;
  patient_share?: number | null;
  minUnitPrice?: number | null;
  maxUnitPrice?: number | null;
  quantity?: number | null;
  tags?: string[] | null;
  activityCode?: string;
}

export interface ClaimDto {
  id?: string;
  patientId?: string;
  diagnoses?: DiagnosisDto[];
  currentMedications?: MedicationDto[];
  procedures?: ProcedureDto[];
  consumables?: ConsumableDto[];
  drugQuantities?: DrugQuantityDto[];
}

export interface ClaimValidation {
  workflows?: string[] | null;
  workflownames?: string[] | null;
  claimValidationRequests?: ClaimValidationByCodeRequestExtended[];
}

export interface ClaimValidationByCodeRequestExtended {
  activityId?: number;
  patientnid?: string | null;
  patientAge?: number | null;
  diagnosisCodes?: string[] | null;
  activityCodes?: string[] | null;
  claimedNet?: number | null;
  enteredNet?: number | null;
  claimedGross?: number | null;
  enteredGross?: number | null;
  claimStartDate?: string | null;
  claimEndDate?: string | null;
  batchType?: string | null;
  batchServiceMonth?: number | null;
  batchServiceYear?: number | null;
  claimTags?: string[] | null;
  claimNumber?: string | null;
  activities?: ClaimActivityRequestDto[] | null;
}

export interface ClaimValidationResponse {
  success?: string;
  failed?: ClaimValidationResultDto[] | null;
}

export interface ClaimValidationResultDto {
  activityId?: number;
  workFlowName?: string;
  rule?: string | null;
  errorType?: string | null;
  claimNumber?: string | null;
  matchedActivityCodes?: string[] | null;
  claim?: ClaimDto | null;
  normalizedWorkFlowName?: string | null;
}

export interface ConsumableDto {
  id?: number;
  name?: string;
  claimValidationId?: number;
}

export interface DiagnosisDto {
  id?: number;
  code?: string;
  claimValidationId?: number;
}

export interface DrugQuantityDto {
  id?: number;
  drugName?: string;
  quantity?: number;
  claimValidationId?: number;
}

export interface MedicationDto {
  id?: number;
  name?: string;
  claimValidationId?: number;
}

export interface ProcedureDto {
  id?: number;
  code?: string;
  claimValidationId?: number;
}
