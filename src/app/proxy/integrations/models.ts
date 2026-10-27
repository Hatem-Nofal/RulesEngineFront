
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
  errorMessage?: string | null;
  claimNumber?: string | null;
  normalizedWorkFlowName?: string | null;
  maxDailyQuantity?: number | null;
}
