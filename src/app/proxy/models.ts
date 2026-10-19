
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
  genericCode?: string | null;
  dtgCodes?: string[] | null;
}

export interface ClaimValidationByCodeRequestExtended {
  claimspeccode?: string | null;
  activityId?: number;
  patientnid?: string | null;
  age?: number;
  gender?: string | null;
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
  diagnosisGroupCodes?: string[] | null;
}
