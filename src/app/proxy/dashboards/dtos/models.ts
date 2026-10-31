
export interface ActivityViolationsCountDto {
  activity?: string;
  violationsCounts?: number;
}

export interface ActivityViolationsDto {
  activityViolationsCounts?: ActivityViolationsCountDto[];
  total?: number;
}

export interface ClaimNumberViolationsCountDto {
  claimNumber?: string;
  violationsCounts?: number;
}

export interface ClaimNumberViolationsDto {
  claimNumberViolationsCount?: ClaimNumberViolationsCountDto[];
  total?: number;
}

export interface DashboardFilterDto {
  workFlowName?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  activity?: string | null;
}

export interface RuleViolationsCountDto {
  ruleName?: string;
  violationsCounts?: number;
}

export interface RuleViolationsDto {
  ruleViolationsCounts?: RuleViolationsCountDto[];
  total?: number;
}

export interface ViolationsDetailsDto {
  maxWorkFlowNameViolated?: string;
  maxWorkFlowViolatedCount?: number;
  maxRuleNameViolated?: string;
  maxRuleViolatedCount?: number;
  maxActivityViolated?: string;
  maxActivityViolatedCount?: number;
  maxClaimNumberViolated?: string;
  maxClaimNumberViolatedCount?: number;
  totalViolationCount?: number;
}

export interface WorkflowViolationsCountDto {
  workFlowName?: string;
  violationsCounts?: number;
}

export interface WorkflowViolationsDto {
  workflowViolationsCount?: WorkflowViolationsCountDto[];
  total?: number;
}
