
export interface UpdateActivityWithAuditDto {
  activityId?: number;
  activityTags: number[];
  approvedAmount?: number;
  rejectedAmount?: number;
  activityRejectionReasons: number[];
}
