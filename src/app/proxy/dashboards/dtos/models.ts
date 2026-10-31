
export interface ActivityViolationsCountDto {
  activity?: string;
  violationsCounts?: number;
}

export interface ClaimNumberViolationsCountDto {
  claimNumber?: string;
  violationsCounts?: number;
}

export interface RuleViolationsCountDto {
  ruleName?: string;
  violationsCounts?: number;
}

export interface WorkflowViolationsCountDto {
  workFlowName?: string;
  violationsCounts?: number;
}
