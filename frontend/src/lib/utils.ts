import { FilterState } from "@/context/jobs/filter-context";

export function CreateQueryString(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else {
      params.set(key, value.toString());
    }
  }

  return params.toString();
}