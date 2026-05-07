const http = require("http");

const ADMIN_TOKEN = "admin123";
const USER_TOKEN = "abc123";

const VALID_ROUTES = [
  "/api/users",
  "/api/users/1",
  "/api/profile",
  "/api/orders",
  "/api/orders/1",
  "/api/admin",
  "/api/admin/users",
];

function getRole(req) {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  if (token === ADMIN_TOKEN) return "admin";
  if (token === USER_TOKEN) return "user";
  return null;
}

const server = http.createServer((req, res) => {
  const role = getRole(req);
  const method = req.method;
  const url = req.url;

  // unknown route — 404 immediately
  const basePath = url.replace(/\/\d+$/, "/1");
  if (!VALID_ROUTES.includes(url) && !VALID_ROUTES.includes(basePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  // no token
  if (!role) {
    if (["/api/users", "/api/profile", "/api/orders"].includes(url)) {
      res.writeHead(401);
      res.end("Unauthorized");
      return;
    }
  }

  // admin routes — admin only
  if (url.startsWith("/api/admin")) {
    if (role !== "admin") {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
  }

  // write methods — admin only (BUG: POST forgotten)
  if (["DELETE", "PATCH", "PUT"].includes(method)) {
    if (role !== "admin") {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
  }

  // BUG: POST not restricted
  res.writeHead(200);
  res.end(JSON.stringify({ data: "ok" }));
});

server.listen(3000, () => console.log("Test server running on :3000"));
