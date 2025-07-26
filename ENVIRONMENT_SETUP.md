# Environment Setup for Backend Infrastructure

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://qouxnmyxjsstqnpzsqox.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdXhubXl4anNzdHFucHpzcW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MjQ5NzQsImV4cCI6MjA1MDUwMDk3NH0.example

# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Perplexity API
PPLX_API_KEY=your-perplexity-api-key
```

## Supabase Table Setup

Run the following SQL in your Supabase SQL Editor:

```sql
create table query_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  model text,
  inputs jsonb,
  search_params jsonb,
  created_at timestamptz default now(),
  duration_ms integer,
  source_count integer
);
```

## Features Enabled

- **Redis Caching**: 24-hour TTL for duplicate API calls
- **Supabase Logging**: Query metadata and analytics
- **OpenTelemetry**: Performance monitoring
- **Sentry**: Error tracking and monitoring
- **Safe JSON Parsing**: Error tracking for JSON parsing failures 