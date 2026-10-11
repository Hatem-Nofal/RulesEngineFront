import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateOrganizationDto {
  name?: string;
}

export interface OrganizationDto extends EntityDto<string> {
  code?: string;
  displayName?: string;
}

export interface OrganizationListDto extends EntityDto<string> {
  code?: string;
  displayName?: string;
}

export interface OrganizationPagedAndFilterDto extends PagedAndSortedResultRequestDto {
}

export interface UpdateOrganizationDto extends EntityDto<string> {
  code?: string;
  displayName?: string;
}
