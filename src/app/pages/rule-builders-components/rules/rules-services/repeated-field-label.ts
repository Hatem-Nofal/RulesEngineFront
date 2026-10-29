import { RuleNodeType } from "@proxy/common/enums/rule-node-type.enum";
import { RuleNodeDto } from "@proxy/work-flows/dtos/rule-builders-dtos";

/**
 * A rule can use the same field several times (e.g. two "Activity" conditions). The first one is then shown as
 * "Primary Activity", the second as "Secondary Activity" and so on, in the order they appear in the rule.
 * Only the label changes: the node keeps the field key it was given.
 */
const WORDS = [
  "Primary",
  "Secondary"
];

/** 0 -> "Primary", 1 -> "Secondary" ... 10 -> "11th", 20 -> "21st". */
export function ordinalWord(index: number): string {
  if (index < WORDS.length) return WORDS[index];
  const n = index + 1;
  const lastTwo = n % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** "Activity" + 0 -> "Primary Activity". */
export const numberedFieldLabel = (label: string, index: number): string =>
  `${ordinalWord(index)} ${label}`;

/**
 * How many conditions in this subtree use each field key. With `into` the counts are added to an existing
 * tally, which is how a group walks its children in order.
 */
export function countFieldKeys(
  node: RuleNodeDto,
  into: Record<string, number> = {}
): Record<string, number> {
  if (node.nodeType === RuleNodeType.Group) {
    node.children?.forEach((child) => countFieldKeys(child, into));
  } else if (node.fieldKey) {
    into[node.fieldKey] = (into[node.fieldKey] ?? 0) + 1;
  }
  return into;
}
