import axios, { AxiosResponse } from "axios";
import { ScanOptions } from "./types";

export async function request(
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH",
  url: string,
  token: string | null,
  options: ScanOptions,
): Promise<AxiosResponse | null> {
  try {
    return await axios({
      method,
      url,
      headers: token ? { Authorization: `Bearer ${token} ` } : {},
      timeout: options.timeout,
      validateStatus: () => true,
    });
  } catch {
    return null;
  }
}
