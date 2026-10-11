import type { EntityDto } from '@abp/ng.core';

export interface MedicalActivityDto extends EntityDto<number> {
  quantity?: number;
  gross?: number;
  net?: number;
  patient_share?: number;
  price?: number;
  start_Time?: string;
  sub_type_id?: number;
  activity_type_id?: number;
  trackId?: string;
  subActivitiesName?: string;
  activityTags: number[];
  isDeleted: boolean;
}

export interface MedicalActivityWithAuditDto extends EntityDto<number> {
  quantity?: number;
  gross?: number;
  net?: number;
  patient_share?: number;
  start_Time?: string;
  sub_type_id?: number;
  activity_type_id?: number;
  subActivitiesName?: string;
  activityTags: number[];
  auditActivityTags: number[];
  approvedAmount?: number;
  rejectedAmount?: number;
  activityRejectionReasons: number[];
  isDeleted: boolean;
}
