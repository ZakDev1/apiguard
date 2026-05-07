import { ADMIN_PATTERNS, WRITE_METHODS } from "../config/routes";
import { request } from "../utils/http";
import { ScanOptions, Finding } from "../utils/types";

/**
 * BFLA (Broken Function Level Authorization) — OWASP API Top 10 #5
 *
 * Tests whether low-privilege users can access functions they shouldn't such as
 * admin routes, or write operations (DELETE, PATCH, PUT, POST) that should
 * be restricted by role.
 *
 * Unlike BOLA which is about accessing another user's data,
 * BFLA is about accessing actions beyond your privilege level.
 *
 * Requires --role-token to be set, otherwise returns empty findings.
 *
 * @param endpoints - List of active endpoints discovered during scan
 * @param options - Scan config including the low-privilege roleToken
 * @returns Array of findings where function-level auth appears to be missing
 */
export async function runBFLAChecks(endpoints: string[], options: ScanOptions): Promise<Finding[]> {
  const findings: Finding[] = [];

  if (!options.roleToken) return findings;

  for (const endpoint of endpoints) {
    const url = `${options.baseUrl}${endpoint}`;
    const isAdminRoute = ADMIN_PATTERNS.some((p) => endpoint.includes(p));

    if (isAdminRoute) {
      const res = await request("GET", url, options.roleToken, options);
      if (res && res.status === 200) {
        findings.push({
          check: "BFLA",
          method: "GET",
          endpoint,
          severity: "CRITICAL",
          statusCode: res.status,
          detail: `Admin route accessible with low-privilege token`,
        });
      }
    }

    for (const method of WRITE_METHODS) {
      const res = await request(method, url, options.roleToken, options);

      if (res && res.status === 200) {
        findings.push({
          check: "BFLA",
          method,
          endpoint,
          severity: isAdminRoute ? "CRITICAL" : "HIGH",
          statusCode: res.status,
          detail: `${method} succeeded with low-privilege token - function-level auth may be missing`,
        });
      }
    }
  }

  return findings;
}
