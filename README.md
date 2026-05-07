# apiguard

Zero-config API security scanner. Tests for broken authentication and 
authorization vulnerabilities based on the OWASP API Security Top 10.

## Install

```bash
npm install -g apiguard
# or run without installing
npx apiguard scan <url> --token <jwt>
```

## Usage

```bash
# Basic scan
apiguard scan http://localhost:3000 --token eyJhb...

# With role token for BFLA checks
apiguard scan http://localhost:3000 --token eyJhb... --role-token eyJhb...
```

## Checks

**UNAUTH** — Strips the auth token and checks which endpoints still return 200.
Should return 401 or 403.

**BOLA** (Broken Object Level Authorization) — Takes ID-based routes and probes 
neighbouring IDs with your token. Flags any that return 200 without ownership 
verification. #1 in OWASP API Top 10.

**BFLA** (Broken Function Level Authorization) — Replays write operations 
(DELETE, PATCH, PUT, POST) and admin routes using a lower-privilege token. 
Flags anything that doesn't return 403. Requires --role-token.

## Disclaimer

Results are candidates for investigation, not confirmed exploits. Always verify 
findings manually. Only scan APIs you own or have permission to test.
