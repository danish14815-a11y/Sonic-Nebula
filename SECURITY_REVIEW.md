# Security Review – Sonic Nebula

This document summarises a focused security review of the `danish14815-a11y/Sonic-Nebula` repository performed against the checklist requested in the PR: hardcoded secrets, SQL injection, unvalidated user input, insecure dependencies, overly permissive CORS, exposed debug endpoints and missing authentication checks.

The code in scope is small (a FastAPI backend that proxies JioSaavn plus a React frontend), so this review is exhaustive for the categories above. The PR that introduces this file fixes all items marked **Fixed** below.

## Severity legend

- **High** – should be patched immediately.
- **Medium** – defence-in-depth issue; can be exploited in combination with other problems.
- **Low / Info** – best-practice or minor hardening.

---

## Findings

### 1. Overly permissive CORS with credentials (High — Fixed)

`backend/server.py` configured CORS as:

```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Problems:

- The default `CORS_ORIGINS=*` produced `allow_origins=["*"]` *with* `allow_credentials=True`. Starlette's `CORSMiddleware` then echoes the request `Origin` back and sets `Access-Control-Allow-Credentials: true`, which lets **any** origin make authenticated cross-origin requests. This is the canonical CORS misconfiguration.
- `allow_methods=["*"]` and `allow_headers=["*"]` are broader than needed for a read-only proxy.

`backend/.env` also shipped `CORS_ORIGINS="*"`, so the misconfig was the default in production.

**Fix:** if the configured origins list is empty or contains `*`, the app now forces `allow_credentials=False` and logs a warning. Methods and headers are restricted to the ones actually used (`GET`, `HEAD`, `OPTIONS`; `Content-Type`, `Authorization`).

### 2. Unvalidated query / path parameters (Medium — Fixed)

All search endpoints accepted arbitrary `page`/`limit` integers (no upper bound) and arbitrary strings for `song_id`, `artist_id`, album `id`, playlist `id`. These are interpolated directly into the upstream URL:

```python
return await proxy_saavn(f"/songs/{song_id}")
```

Risks:

- DoS / resource abuse via `limit=10_000_000` or `page=10_000_000` on the upstream.
- Path segments containing `..` or other control characters being forwarded to the upstream service, giving a limited SSRF-style primitive against `saavn.sumit.co`. FastAPI's default path converter doesn't match `/`, which reduced impact, but the app still happily forwarded `../`-style tokens.

**Fix:**

- `page` is bounded to `[0, 100]`, `limit` to `[1, 50]`, `query` to 1–200 characters.
- All ID parameters are constrained with `pattern=r"^[A-Za-z0-9_-]{1,64}$"` at the route level and re-validated in-handler via `_validate_id()` for defence in depth.

### 3. Cross-site scripting via `dangerouslySetInnerHTML` (Medium — Fixed)

Six React components rendered upstream strings (`track.name`, `album.name`, `artist.name`, `playlist.name`, `playlist.description`) through `dangerouslySetInnerHTML`. JioSaavn returns HTML-entity-encoded text (e.g. `Hai&#039;rat`), so this was being used purely to decode entities — but it also happily executes any HTML/JS returned by the upstream. Because `saavn.sumit.co` is an unofficial third-party API we do not control, that is a stored-XSS surface: if the upstream is ever compromised or returns attacker-influenced content, malicious markup runs in every user's browser.

**Fix:** added `decodeHtmlEntities()` to `frontend/src/lib/utils.js`. It uses a detached `<textarea>` to decode entities (matching the previous visible behaviour) while returning plain text, and replaces all six `dangerouslySetInnerHTML` usages.

### 4. `.gitignore` was named `gitignore.txt` (High — Fixed)

The ignore file shipped as `gitignore.txt`, so Git was not actually ignoring anything listed in it (`.env`, `node_modules/`, `*.pem`, `credentials.json`, …). As a direct consequence, `backend/.env` and `frontend/.env` were tracked in the repository. Today they contain placeholder values (`mongodb://localhost:27017`, a public preview URL), but the setup means the next developer to drop a real secret into `.env` will commit it without warning.

**Fix:**

- Renamed `gitignore.txt` → `.gitignore`.
- Removed `backend/.env` and `frontend/.env` from the index (left on disk locally for developer convenience).

### 5. Hardcoded secrets / API keys (None found — Info)

Checked `backend/`, `frontend/src/`, `vercel.json`, `README.md` and git history for:

- API-key patterns (`sk-…`, `AKIA…`, generic `api[_-]?key` / `token` assignments).
- Credential-style strings in commits.

Nothing sensitive is committed. The backend reads all configuration from environment variables. `backend/.env` contains only localhost defaults (flagged in finding 4). `frontend/plugins/visual-edits/dev-server-setup.js` reads a code-server password from Supervisor config at runtime — not a hardcoded secret, and only part of the optional development tooling.

### 6. SQL injection (Not applicable — Info)

The backend uses MongoDB via Motor but does not issue any queries in the current code (`db` is obtained but never read/written). There is no SQL in the project. No findings.

### 7. Missing authentication checks (By design — Info)

Per the README, Sonic Nebula is an unauthenticated public proxy ("zero ads, no subscription, no login"). There are no privileged endpoints, user accounts, or per-user data to protect. There is consequently nothing that *should* have an auth check and does not. If authentication is ever added, every route under `/api/` will need review.

### 8. Exposed debug endpoints (Info)

- FastAPI's default OpenAPI docs (`/docs`, `/redoc`, `/openapi.json`) are enabled. That leaks the schema but no data; acceptable for a public API. If you want to close them in production, pass `docs_url=None, redoc_url=None, openapi_url=None` to `FastAPI(...)` or gate them behind an env flag.
- `GET /api/health` is a liveness endpoint, not a debug endpoint.
- No `/debug`, `/__debug__`, Django-style debug toolbars, or stack-trace pages are exposed.

### 9. Dependency surface (Low — Informational)

`backend/requirements.txt` pins ~120 packages, the vast majority of which are not imported anywhere in `backend/` (e.g. `boto3`, `stripe`, `openai`, `google-genai`, `litellm`, `pandas`, `numpy`, `huggingface_hub`, `tiktoken`, `python-jose`, `passlib`, `bcrypt`). Each extra dependency is:

- a supply-chain attack surface;
- a potential source of future CVEs that will force churn;
- larger cold-start / deploy size on Vercel.

The only imports actually required by `backend/server.py` are `fastapi`, `starlette`, `motor`, `httpx`, `python-dotenv` and (for local dev) `uvicorn`. **Recommended follow-up:** regenerate `requirements.txt` from just these direct dependencies. This PR intentionally leaves the file alone to avoid breaking the existing Vercel deploy in a pure-security change; track it as a separate cleanup.

Nothing currently pinned has a known critical CVE matching its pinned version that is exploitable in this codebase (the app has no file-upload handling that would be affected by the historical Starlette multipart DoS, for example).

### 10. Rate limiting (Low — Not fixed)

No per-IP rate limiting is applied to the proxy routes. A single client can trivially push the instance over the JioSaavn upstream's rate limits or rack up Vercel usage. Consider `slowapi` or fronting the service with a reverse-proxy / edge rate limiter. Out of scope for this PR.

---

## Summary of changes in this PR

| Area | Change |
| --- | --- |
| CORS | Never combine `allow_credentials=True` with `*`; lock down methods/headers. |
| Input validation | `query`/`page`/`limit` bounded; ID path params restricted to `[A-Za-z0-9_-]{1,64}`. |
| Frontend XSS | New `decodeHtmlEntities` helper; removed every `dangerouslySetInnerHTML` usage. |
| Secrets hygiene | Renamed `gitignore.txt` → `.gitignore`; untracked `backend/.env` and `frontend/.env`. |
| Docs | Added this `SECURITY_REVIEW.md`. |

## Recommended follow-ups (not in this PR)

1. Trim `backend/requirements.txt` to the six libraries actually imported.
2. Add per-IP rate limiting to the `/api/*` proxy.
3. Disable `/docs` and `/openapi.json` in production deployments if the OpenAPI schema should not be public.
4. Consider replacing the unofficial JioSaavn proxy with the official API or caching aggressively via the Mongo instance that is already connected but unused.
