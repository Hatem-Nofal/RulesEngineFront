export interface CustomDropDownOption {
  id?: string,
  name?: string
}
export interface CustomDropDown {
  name?: string,
  label?: 'Filter By:',
  type?: 'dropdown',
  value?: string,
  validators?: [],
  options: CustomDropDownOption[]
}