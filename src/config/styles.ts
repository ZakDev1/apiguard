import chalk from "chalk";
import { Severity } from "../utils/types";

/**
 * Terminal colour mapping for each severity level.
 * Used by the reporter to visually distinguish finding importance.
 */
export const SEVERITY_COLOUR: Record<Severity, typeof chalk> = {
  CRITICAL: chalk.bgRed.white.bold,
  HIGH: chalk.red.bold,
  MEDIUM: chalk.yellow.bold,
  INFO: chalk.gray,
} as const;
/**
 * Severity levels in descending order of importance.
 * Used to determine the highest severity for a group of findings.
 */
export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "INFO"];
