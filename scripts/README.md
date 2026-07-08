# Database scripts

Run these against your Supabase Postgres instance, in order, before signing in
or using product features locally.

1. `sql/001_better_auth_core.sql` — Better Auth's `user`/`session`/`account`/`verification` tables.
2. `sql/002_app_schema.sql` — `workspaces`, `workspace_members`, `products`.
3. `sql/003_channel_readiness.sql` — `channels` + `channel_rules`, seeded with the Channel Readiness Engine rulebook.

## How to run

Either paste each file into the Supabase SQL editor (Project > SQL Editor > New query), in order, or from a terminal with `psql` installed:

```bash
psql "$DATABASE_URL" -f scripts/sql/001_better_auth_core.sql
psql "$DATABASE_URL" -f scripts/sql/002_app_schema.sql
psql "$DATABASE_URL" -f scripts/sql/003_channel_readiness.sql
```

`DATABASE_URL` is the Postgres connection string from Supabase's Project Settings > Database page (also set in `.env`).

## Note on `001_better_auth_core.sql`

This is Better Auth's documented default schema for the version pinned in `package.json`. If you upgrade `better-auth` later, regenerate and diff against it with:

```bash
npx @better-auth/cli generate
```

before assuming the hand-written schema here is still accurate.
