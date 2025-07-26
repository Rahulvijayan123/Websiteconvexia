# Environment Setup for Backend Infrastructure

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://qouxnmyxjsstqnpzsqox.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdXhubXl4anNzdHFucHpzcW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIxMTU4NCwiZXhwIjoyMDY4Nzg3NTg0fQ.wxbleqJjxA__SjJh5-S9PienvAagRxzDoPRYIOGA_4g

# Perplexity API
PPLX_API_KEY=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

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://magnetic-gar-52864.upstash.io
UPSTASH_REDIS_REST_TOKEN=Ac6AAAIjcDE1MzdlN2ZjNzk0ZmI0YWZkOWJjNWYxMDhlNDFhNTllYXAxMA

# Optional Configuration
REVENUE_DIFF_TOLERANCE=2
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
  source_count integer,
  trace_id text
);
```

## Features Enabled

- **Redis Caching**: 24-hour TTL for duplicate API calls with msgpackr serialization
- **Supabase Logging**: Query metadata and analytics with trace_id tracking
- **Body Size Guard**: 1MB request limit with HTTP 413 responses
- **Real Token Counting**: Accurate token estimation using tiktoken
- **Stable Cache Keys**: Deterministic hashing with fast-json-stable-stringify
- **Timeout Protection**: 60-second AbortController for Perplexity API calls
- **Enhanced Error Handling**: Type-safe error responses with trace IDs
- **Cache Size Validation**: 8MB limit with graceful fallback
- **Revenue Tolerance**: Configurable magnitude difference warnings
- **Zero-Division Guards**: Safe mathematical operations
- **Cache Control Headers**: no-store directive for API responses 