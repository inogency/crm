# Self-hosted web app (Next.js). Build context: repo root.
FROM node:22-slim
COPY --from=oven/bun:1.4.5-slim /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun install --frozen-lockfile
# API_URL is inlined into the browser bundle as NEXT_PUBLIC_API_URL: it must be set at build time.
ARG API_URL
ARG APP_URL
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 CRM_TELEMETRY_DISABLED=1
RUN test -n "$API_URL" && cd apps/app && DATABASE_URL=postgresql://build:build@localhost:5432/build bun run build
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
	CMD curl -fsS -o /dev/null http://127.0.0.1:3000/sign-in || exit 1
WORKDIR /repo/apps/app
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
