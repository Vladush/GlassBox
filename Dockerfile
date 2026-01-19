FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Enable corepack just in case, though we use npm
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# Install all deps
RUN npm install
# Build everything (turbo will handle order: db -> api, web)
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services ./services
COPY --from=builder /app/tsconfig.base.json .

# Seed the DB (Optional, but good for self-contained demo)
# In production, this would be a separate init container or job
# RUN npm run seed --workspace=@glassbox/db

# Expose port
EXPOSE 3001

# Start API (which serves Web)
CMD sh -c "npm run migrate --workspace=@glassbox/db && npm run seed --workspace=@glassbox/db && npm start --workspace=@glassbox/api"
