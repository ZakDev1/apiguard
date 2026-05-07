import { request } from "../utils/http";
import { ScanOptions, Finding } from "../utils/types";

/**
 * Unauthenticated Access Check - OWASP API Top 10 #2
 *
 * Tests whether endpoints return data without any auth token present.
 * Strips the Authorization header entirely and checks which routes
 * still respond with 200 - these should be returning 401 or 403.
 *
 * This is the most basic auth check and often catches misconfigured
 * middleware, forgotten route handlers, or endpoints added in a hurry
 * without auth being wired up.
 *
 * Note: Some endpoints are intentionally public (e.g. /api/health,
 * /api/status). Cross-reference findings against your known public
 * routes before treating them as vulnerabilities.
 *
 * @param endpoints - List of active endpoints discovered during scan
 * @param options - Scan config, token is not used here but passed for consistency
 * @returns Array of findings where endpoints are publicly accessible without auth
 */
export async function runUnauthChecks(endpoints: string[], options: ScanOptions): Promise<Finding[]> {
  const findings: Finding[] = [];

  for (const endpoint of endpoints) {
    const url = `${options.baseUrl}${endpoint}`;
    const res = await request("GET", url, null, options);

    if (res && res.status === 200) {
      findings.push({
        check: "UNAUTH",
        method: "GET",
        endpoint,
        severity: "HIGH",
        statusCode: res.status,
        detail: `Endpoint returned 200 with no auth token - should be 401`,
      });
    }
  }

  return findings;
}
