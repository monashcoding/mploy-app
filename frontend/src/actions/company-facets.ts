"use server";

import { JobFilters, CompanyFacet } from "@/types/filters";
import { getCompanyFacets as fetchCompanyFacets } from "./jobs.fetch";

/**
 * Server action exposing company facet counts to client components.
 * Thin wrapper around the data-layer implementation in `jobs.fetch.ts` so that
 * MongoDB-dependent code stays server-side and is never bundled to the client.
 */
export async function getCompanyFacets(
  filters: Partial<JobFilters>,
): Promise<CompanyFacet[]> {
  return fetchCompanyFacets(filters);
}
