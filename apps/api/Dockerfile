# Multi-stage build; context = repo root (full workspace, pruned build later per ADR note)
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
# turbo's platform binary needs postinstall scripts (blocked by --ignore-scripts);
# pnpm's recursive filter builds in topological dependency order, which is all we need here.
RUN pnpm -r --filter @pravah/api... build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/apps/api/drizzle ./apps/api/drizzle
WORKDIR /app/apps/api
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "dist/server.js"]
