# Self-hosted API (NestJS on Bun). Build context: repo root.
FROM node:22-slim
COPY --from=oven/bun:1.4.5-slim /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY . .
# prisma.config.ts reads DATABASE_URL even for `prisma generate`; the real one comes at runtime.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun install --frozen-lockfile
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
	CMD curl -fsS http://127.0.0.1:3001/health || exit 1
# Migrations run on every start (idempotent), then the API.
CMD ["sh", "-c", "cd /repo/packages/db && bun run db:deploy && cd /repo/apps/api && exec bun src/main.ts"]
