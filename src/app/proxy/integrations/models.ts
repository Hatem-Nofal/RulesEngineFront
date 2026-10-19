
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
  maxDailyQuantity?: number | null;
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
