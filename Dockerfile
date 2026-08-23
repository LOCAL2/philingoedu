FROM oven/bun:latest

WORKDIR /app

# Install procps so concurrently can use the 'ps' command
RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

# Copy everything (node_modules is ignored via .dockerignore)
COPY . .

# Remove Windows bun.lock to force a fresh resolution for Linux native deps
RUN rm -f bun.lock && bun install

# API Server uses 8080, Admin uses 3001, Philingo uses 5173 inside the container
EXPOSE 8080 3001 5173

CMD ["bun", "run", "dev"]
