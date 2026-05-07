/**
 * Common REST API routes used for endpoint discovery.
 * These are probed against the target to find active endpoints
 * before any security checks are run.
 *
 * Add routes here to expand scan coverage.
 */
export const COMMON_ROUTES = [
  "/api/users",
  "/api/users/1",
  "/api/profile",
  "/api/me",
  "/api/admin",
  "/api/admin/users",
  "/api/orders",
  "/api/orders/1",
  "/api/products",
  "/api/products/1",
  "/api/settings",
  "/api/v1/users",
  "/api/v1/users/1",
  "/api/v1/profile",
  "/api/v1/orders",
];

/**
 * Used for BFLA Check
 * Common patterns for admin API routes and write methods
 */
export const ADMIN_PATTERNS = ["/admin", "/admin/users", "/manage", "/internal"];
export const WRITE_METHODS = ["DELETE", "PATCH", "PUT", "POST"] as const;
