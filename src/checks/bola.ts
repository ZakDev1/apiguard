import { request } from "../utils/http";
import { ScanOptions, Finding } from "../utils/types";

function extractIdRoutes(endpoints: string[]): { original: string; neighbour: string }[] {
  const results = [];

  for (const endpoint of endpoints) {
    const segments = endpoint.split("/");
    const hasId = segments.some((s) => /^\d+$/.test(s));

    if (hasId) {
      const neighbour = endpoint.replace(/\/(\d+)/, (_, id) => {
        const next = parseInt(id) === 1 ? 999 : 1;
        return "/" + next;
      });

      if (!endpoints.includes(neighbour)) {
        results.push({ original: endpoint, neighbour });
      }
    }
  }

  return results;
}

/**
 * BOLA (Broken Object Level Authorization) — OWASP API Top 10 #1
 *
 * Tests whether the server verifies object ownership on ID-based routes.
 * Finds endpoints with numeric IDs (e.g. /api/users/1), then probes a
 * completely different ID with the same token to see if the server returns
 * 200 without checking whether that token owns the requested resource.
 *
 * Example attack: authenticated as user 1, request /api/users/999 -
 * if that returns 200, the server is likely not checking ownership.
 *
 * Note: A 200 response is a candidate, not a confirmed exploit. The server
 * may be intentionally returning public data for that resource. Always
 * verify findings manually.
 *
 * @param endpoints - List of active endpoints discovered during scan
 * @param options - Scan config including the primary user token
 * @returns Array of findings where object-level auth may be missing
 */
export async function runBOLAChecks(endpoints: string[], options: ScanOptions): Promise<Finding[]> {
  const findings: Finding[] = [];
  const idRoutes = extractIdRoutes(endpoints);

  if (idRoutes.length === 0) {
    return findings;
  }

  for (const { neighbour } of idRoutes) {
    const url = `${options.baseUrl}${neighbour}`;
    const res = await request("GET", url, options.token, options);

    if (res && res.status === 200) {
      findings.push({
        check: "BOLA",
        method: "GET",
        endpoint: neighbour,
        severity: "HIGH",
        statusCode: res.status,
        detail: `Accessed ${neighbour} using token - server may not be verifying object ownership`,
      });
    }
  }

  return findings;
}
