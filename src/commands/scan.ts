import chalk from "chalk";
import { runUnauthChecks } from "../checks/uauth";
import { request } from "../utils/http";
import { Finding, ScanOptions, Severity } from "../utils/types";
import { runBOLAChecks } from "../checks/bola";
import { discoverEndpoints, filterExistingEndpoints } from "../utils/discover";
import { runBFLAChecks } from "../checks/bfla";
import ora from "ora";
import { SEVERITY_COLOUR, SEVERITY_ORDER } from "../config/styles";

// Removes any duplicate findings from the scan
function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.check}-${f.method}-${f.endpoint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Entry point for a full API security scan.
 * Orchestrates endpoint discovery, runs all checks in sequence,
 * and prints a grouped report sorted by severity.
 *
 * Checks run: UNAUTH → BOLA → BFLA (if --role-token provided)
 *
 * @param baseUrl - The base URL to scan e.g. http://localhost:3000
 * @param options - Parsed CLI flags from Commander
 */
export async function scanCommand(baseUrl: string, options: any) {
  const startTime = Date.now();

  const scanOptions: ScanOptions = {
    baseUrl,
    token: options.token,
    roleToken: options.roleToken,
    timeout: 5000,
    verbose: false,
  };

  const healthCheck = await request("GET", scanOptions.baseUrl, null, scanOptions);
  if (!healthCheck) {
    console.log(chalk.red(`\n  Cannot reach ${scanOptions.baseUrl} - is the server running?\n`));
    process.exit(1);
  }

  console.log("");
  console.log(chalk.bold("apiguard") + chalk.gray(" - scanning " + baseUrl));
  console.log("");

  const discovered = await discoverEndpoints();
  const spinner = ora("Probing endpoints...").start();
  const endpoints = await filterExistingEndpoints(discovered, scanOptions);
  spinner.succeed(`Found ${endpoints.length} active endpoints`);

  console.log(chalk.gray(`Testing ${endpoints.length} endpoints...\n`));

  const unauthFindings = await runUnauthChecks(endpoints, scanOptions);
  const bolaFindings = await runBOLAChecks(endpoints, scanOptions);
  const bflaFindings = await runBFLAChecks(endpoints, scanOptions);

  printFindings(dedupeFindings([...unauthFindings, ...bolaFindings, ...bflaFindings]));

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.gray(`\nCompleted in ${duration}s`));
}

function printFindings(findings: Finding[]) {
  console.log(chalk.bold("Results"));
  console.log(chalk.gray("─".repeat(40)));

  if (findings.length === 0) {
    console.log(chalk.green("✓ No issues found"));
    return;
  }

  const grouped = findings.reduce(
    (acc, f) => {
      if (!acc[f.endpoint]) acc[f.endpoint] = [];
      acc[f.endpoint].push(f);
      return acc;
    },
    {} as Record<string, Finding[]>,
  );

  for (const [endpoint, endpointFindings] of Object.entries(grouped)) {
    const topSeverity = SEVERITY_ORDER.find((s) => endpointFindings.some((f) => f.severity === s)) ?? "INFO";

    const badge = SEVERITY_COLOUR[topSeverity](`[${topSeverity}]`);
    console.log(`${badge} ${chalk.white(endpoint)}`);

    for (const f of endpointFindings) {
      const method = chalk.cyan(f.method.padEnd(7));
      const check = chalk.gray(`[${f.check}]`);
      console.log(`  ${method} ${check} ${f.detail}`);
    }
    console.log("");
  }

  console.log(chalk.gray("─".repeat(40)));

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const summary = Object.entries(counts)
    .map(([sev, count]) => SEVERITY_COLOUR[sev as Severity](`${count} ${sev}`))
    .join(chalk.gray(" · "));

  console.log(summary);
  console.log(chalk.gray(`${findings.length} total findings across ${Object.keys(grouped).length} endpoints`));
}
