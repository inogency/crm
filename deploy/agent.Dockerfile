# Research agent (eve) for self-hosting on Coolify. Internal only: the app proxies
# /eve/v1/* to it and the API pokes it, both over the Docker network (AGENT_URL).
# ponytail: no Docker socket, no KVM → eve's default sandbox falls back to just-bash
# (in-process, no network). Mount the Docker socket only if a real container sandbox is needed.
# eve requires Node >= 24
FROM node:24-slim
COPY --from=oven/bun:1.4.5-slim /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun install --frozen-lockfile
WORKDIR /repo/apps/agent
ENV NODE_ENV=production CRM_TELEMETRY_DISABLED=1
# just-bash is an optional peer of eve, needed for the fallback sandbox; 3.1.0 is the version eve is built against.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun add just-bash@3.1.0
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build node_modules/.bin/eve build
EXPOSE 2000
# Workflow run state lives in .eve/.workflow-data: mount it on a volume so runs survive redeploys.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD curl -fsS http://127.0.0.1:2000/eve/v1/health || exit 1
CMD ["node_modules/.bin/eve", "start", "--host", "0.0.0.0", "--port", "2000"]
