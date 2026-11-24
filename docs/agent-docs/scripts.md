# `scripts/` — project helper scripts

Small operational scripts that support development, testing or monitoring. They
are **not** part of either npm project: no build step, no CI coverage, no
dependencies beyond the system tools they call. They are also **not** loaded by
the API or the webapp, so adding one cannot change product behavior.

Conventions for anything placed here:

- Bash with `#!/usr/bin/env bash` and `set -uo pipefail`, executable bit set.
- Comments, `echo` output and help text in **Portuguese** (team convention).
- Configuration through environment variables or positional arguments —
  never hardcoded hosts, phone numbers or credentials.
- A header comment with usage examples is the documentation; this file only
  summarizes.

## Inventory

| Script | Purpose |
| --- | --- |
| `ping-watch.sh` | Polls `GET /api/ping` and reports when the API goes down and when it comes back (terminal, optionally SMS via Twilio). |

## `ping-watch.sh`

```bash
./scripts/ping-watch.sh [url] [intervalo_em_segundos]

./scripts/ping-watch.sh                                       # localhost:3000, every 30 s
./scripts/ping-watch.sh http://192.168.0.10:3000/api/ping 15
```

- Default URL respects `RECICLA_API_PORT` (`http://localhost:<port>/api/ping`),
  matching the API's own port variable. Default interval is 30 s.
- It reports **state transitions only** — one line when the API stops answering
  and one when it recovers — instead of one line per poll.
- "Up" means an HTTP `2xx` from `/api/ping`. Any other code is treated as down
  and printed verbatim (`HTTP 000` = no TCP/TLS answer at all), so a `429` or
  `500` is distinguishable from an unreachable server instead of being mistaken
  for a healthy response.
- Each check uses `--max-time 5`, so a hanging TCP connection cannot stall the
  loop.
- Runs until `Ctrl+C`; there is no `--once`/`--for` mode yet. For a bounded run,
  wrap it in `timeout`.

### SMS notifications (optional, off by default)

SMS is enabled only when all four variables are set; otherwise the script stays
terminal-only and makes no network call to Twilio:

```bash
export TWILIO_ACCOUNT_SID="AC..."   # Twilio Account SID
export TWILIO_AUTH_TOKEN="..."      # Twilio auth token — secret, keep out of the repo
export TWILIO_FROM="+1..."          # Twilio number that sends
export TWILIO_TO="+55..."           # number that receives
./scripts/ping-watch.sh
```

Implementation notes:

- One SMS per transition, so an outage produces at most two messages (down,
  then up). A flapping server produces a pair per flap; there is no cooldown or
  repeat-suppression window yet.
- Credentials are piped to `curl` through `--config -` (stdin) so they do not
  appear in the process command line (`ps`, `/proc/<pid>/cmdline`).
  `--data-urlencode` handles the `+` in phone numbers and spaces in the body.
- A failed send prints `falha ao enviar SMS` to stderr and the watch loop keeps
  running; SMS failure never stops monitoring.
- Account-side Twilio details (trial restrictions on verified recipients, price
  per message, A2P 10DLC registration in the US) are out of scope here.

### Rate limits

`/api/ping` falls under the global limiter (100 requests / 15 min per IP, see
[`api.md`](api.md)). The 30 s default costs ~30 requests per window. Intervals
below ~10 s (90 per window) start to consume that budget and will eventually
surface `HTTP 429` in the output — which is a rate-limit signal, not an outage.
Pointing several watchers at the same API from the same IP adds up.
