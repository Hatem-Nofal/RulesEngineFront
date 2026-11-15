import { FormConfigEditComponent } from "../form-config-edit-component";
type FieldItem = ReturnType<FormConfigEditComponent["available"]>[number];
const UNGROUPED_LABEL = "Ungrouped";

type GroupableField = FieldItem & { groupName?: string | null };

interface FieldGroup {
  name: string;
  fields: FieldItem[];
}

export { FieldGroup, FieldItem, UNGROUPED_LABEL, GroupableField };
