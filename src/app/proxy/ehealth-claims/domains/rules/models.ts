
export interface ImportRulesDto {
  workflowId: number;
  fileBase64?: string;
  fileName?: string;
}

export interface ActivityTypeLookUpDto {
  id: number;
  description?: string;
}

export interface BatchValidationRequest {
  batchIds: number[];
  workflowIds: number[];
}

export interface DiagnosisDto {
  id: number;
  code?: string;
  name?: string;
}

export interface DiagnosisFilterDto {
  code?: string;
  selectedIds: number[];
}

export interface MedicationDto {
  id: number;
  code?: string;
  name?: string;
}

export interface MedicsFilterDto {
  code?: string;
  selectedIds: number[];
  activitytypeId: number;
}

export interface RuleDto {
  id: number;
  ruleName?: string;
  workflowName?: string;
  workFlowId: number;
  enabled: boolean;
  successEvent?: string;
  errorMessage?: string;
  isActivityQuantityByAgeRange?: boolean;
  minPatientAge?: number;
  maxPatientAge?: number;
  errorType?: string;
  ruleExpressionType?: string;
  diagnoses: DiagnosisDto[];
  medications: MedicationDto[];
  procedures: string[];
  patientAge?: number;
  patientGender?: string;
  expression?: string;
  diagnosisIds: number[];
  medicationIds: number[];
  secondDiagnosisIds: number[];
  secondMedicationIds: number[];
  ageOperator?: string;
  quantity?: number;
  diagnosisId?: number;
  medicationId?: number;
  isHaveQuantity?: boolean;
  quantityOperator?: string;
  isDrugToDiagnosis?: boolean;
  isDailyOverDose?: boolean;
  isDrugOverDose?: boolean;
  isDrugWithSpecificDiagnosis?: boolean;
  isActivityWithSpecificActivity?: boolean;
  isDiagnosisWithSpecificDiagnosis?: boolean;
  diagnosisCounts: Record<string, number>;
  medicationCounts: Record<string, number>;
  haveAge?: boolean;
  haveGender?: boolean;
  activityTypeId?: number;
  secondaryActivityTypeId?: number;
  validationErrors: string[];
  isWrongEnteredNet?: boolean;
  isWrongEnteredGross?: boolean;
  isIncorrectNID?: boolean;
  isInvalidClaimStartDate?: boolean;
  isInvalidClaimEndDate?: boolean;
  isAccommodationDaysDontMatchLOS?: boolean;
  isGeneralDiagnosis?: boolean;
  isWrongICDForPhysiotherapy?: boolean;
  isWrongMissingPriceTag?: boolean;
  isMissingTagForInvalidCodes?: boolean;
  isOutlierUnitPrice?: boolean;
  amountTolerance?: number;
  toleranceDays?: number;
  minAllowedClaimDate?: string;
  maxAllowedClaimDate?: string;
  validCodes: string[];
  claimedNet?: number;
  enteredNet?: number;
  claimedGross?: number;
  enteredGross?: number;
  nid?: string;
}

export interface RulesFileDto {
  id: number;
  fileName?: string;
  filePath?: string;
  workFlowId: number;
  workFlowName?: string;
  fileStatus?: string;
}

export interface RulesFilterModel {
  pageNumber: number;
  pageSize: number;
  workFlowId?: number;
  ruleName?: string;
}

export interface WorkFlowDto {
  id: number;
  name?: string;
  isDiagnose?: boolean;
  isMedics?: boolean;
  isPatientAge?: boolean;
  isPatientGender?: boolean;
  patientAge?: number;
  patientGender?: string;
  isDrugToDrug?: boolean;
  isMedicsToMedics?: boolean;
  ageOperator?: string;
  isActivityQuantityByAgeRange?: boolean;
  isHaveQuantity?: boolean;
  quantityOperator?: string;
  isDrugToDiagnosis?: boolean;
  isDailyOverDose?: boolean;
  isPatientAgeActivities?: boolean;
  isPatientAgeDiagnosis?: boolean;
  isPatientGenderDiagnosis?: boolean;
  isPatientGenderActivities?: boolean;
  isDrugOverDose?: boolean;
  isDrugWithSpecificDiagnosis?: boolean;
  isActivityWithSpecificActivity?: boolean;
  isDiagnosisWithSpecificDiagnosis?: boolean;
  isWrongEnteredNet?: boolean;
  isWrongEnteredGross?: boolean;
  isIncorrectNID?: boolean;
  isInvalidClaimStartDate?: boolean;
  isInvalidClaimEndDate?: boolean;
  isAccommodationDaysDontMatchLOS?: boolean;
  isGeneralDiagnosis?: boolean;
  isWrongICDForPhysiotherapy?: boolean;
  isWrongMissingPriceTag?: boolean;
  isMissingTagForInvalidCodes?: boolean;
  rulesCount: number;
}

export interface WorkflowDropDownDto {
  id: number;
  workflowName?: string;
}
