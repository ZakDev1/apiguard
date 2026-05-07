export interface ScanOptions {
  baseUrl: string;
  token: string;
  roleToken?: string;
  outputPath?: string;
  timeout: number;
  verbose: boolean;
}

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";

export interface Finding {
  check: string;
  method: string;
  endpoint: string;
  severity: Severity;
  detail: string;
  statusCode: number;
}
