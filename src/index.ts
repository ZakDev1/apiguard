#!/usr/bin/env node

import { Command } from "commander";
import { scanCommand } from "./commands/scan";

const program = new Command();

program.name("apiguard").description("Zero-config API security scanner").version("0.1.0");

program
  .command("scan <baseUrl>")
  .description("Scan an API for auth vulnerabilities")
  .requiredOption("-t, --token <token>", "Primary user JWT")
  .option("-r, --role-token <token>", "Lower-privilege token for BFLA checks")
  .option("-o, --output <path>", "Write HTML report to file")
  .option("--verbose", "Show every request made")
  .action(scanCommand);

program.parse();
