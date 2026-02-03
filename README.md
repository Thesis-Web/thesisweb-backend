# thesisweb-backend

Small, security-conscious backend services for thesisweb.com and thesisweb.org.

## Goals (initial)
- Email capture endpoint for thesisweb.com
- Store signups locally on the droplet (SQLite first)
- Run behind nginx, bound to 127.0.0.1, managed by systemd

## Non-goals
- Self-hosted SMTP (use a transactional provider)
- Admin UI (unless later required)

## Layout
- src/            app code (API)
- infra/nginx/    reference nginx snippets
- infra/systemd/  reference systemd unit files
- scripts/        ops scripts (backups, migrations)
