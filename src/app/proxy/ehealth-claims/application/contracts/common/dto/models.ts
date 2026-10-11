
export interface SelectedDropDownList {
  id: number;
  name?: string;
  disabled: boolean;
  code?: string;
}

export interface SelectedWithPriceDropDownList extends SelectedDropDownList {
  price?: number;
}

export interface SelectedWithProviderDropDownList extends SelectedDropDownList {
  code?: string;
  type?: string;
}
