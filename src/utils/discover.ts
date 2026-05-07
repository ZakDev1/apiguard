import { COMMON_ROUTES } from "../config/routes";
import { request } from "./http";
import { ScanOptions } from "./types";
import { input, select } from "@inquirer/prompts";

export async function filterExistingEndpoints(endpoints: string[], options: ScanOptions): Promise<string[]> {
  const existing: string[] = [];

  for (const endpoint of endpoints) {
    const url = `${options.baseUrl}${endpoint}`;
    const res = await request("GET", url, options.token, options);
    if (res && res.status !== 404) {
      existing.push(endpoint);
    }
  }

  return existing;
}

export async function discoverEndpoints(): Promise<string[]> {
  const mode = await select({
    message: "How do you want to provide endpoints?",
    choices: [
      { name: "Use built-in common route list", value: "preset" },
      { name: "Enter routes manually", value: "manual" },
      { name: "Both - preset + my own", value: "both" },
    ],
  });

  switch (mode) {
    case "preset":
      return COMMON_ROUTES;

    case "manual":
      return promptManualRoutes();

    case "both": {
      const custom = await promptManualRoutes();
      return [...new Set([...COMMON_ROUTES, ...custom])];
    }

    default:
      return COMMON_ROUTES;
  }
}

async function promptManualRoutes(): Promise<string[]> {
  const raw = await input({
    message: "Enter routes separated by commas (e.g. /api/users, /api/orders/1):",
    validate: (value) => {
      if (!value.trim()) return "Please enter at least one route";
      return true;
    },
  });

  return raw
    .split(",")
    .map((r: string) => r.trim())
    .filter((r: string) => r.startsWith("/"));
}
