// List of available divisions/departments
export const DIVISIONS = [
  "IT",
  "ACC/FINANCE",
  "OPERASIONAL",
  "SALES",
  "CUSTOMER SERVICE",
  "HR",
  "DIREKSI/DIREKTUR",
] as const

export type Division = (typeof DIVISIONS)[number]

export function isValidDivision(division: string): division is Division {
  return DIVISIONS.includes(division as Division)
}
