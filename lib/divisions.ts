// List of available divisions/departments
export const DIVISIONS = [
  "IT & Teknologi",
  "Human Resources",
  "Finance & Accounting",
  "Sales & Marketing",
  "Operations",
  "Customer Service",
  "Logistics & Supply Chain",
  "Quality Assurance",
  "Research & Development",
  "Admin & General",
] as const

export type Division = (typeof DIVISIONS)[number]

export function isValidDivision(division: string): division is Division {
  return DIVISIONS.includes(division as Division)
}
