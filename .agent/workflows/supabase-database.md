---
description: How to use the Supabase MCP for database operations on the ATLAS project
---

# Supabase MCP — Database Operations

Use the Supabase MCP to interact with the ATLAS Reforma project database directly.

## Project Info

- **Project Name**: Atlas Reforma
- **Project ID**: `clsnlzalhiyrkfygpfvp`
- **Region**: sa-east-1 (São Paulo)
- **Organization ID**: `wviszavddkdalwcglzkj`

## Tables

| Table | Description | Rows |
|---|---|---|
| `legal_references` | Normas, leis, portarias, notícias oficiais | 16+ |
| `obligations` | Obrigações tributárias 2026 | 12+ |

## Common Operations

### Read Data

```
# List tables
mcp_supabase-mcp-server_list_tables(project_id="clsnlzalhiyrkfygpfvp", schemas=["public"])

# Execute queries
mcp_supabase-mcp-server_execute_sql(
  project_id="clsnlzalhiyrkfygpfvp",
  query="SELECT * FROM legal_references ORDER BY publication_date DESC LIMIT 5"
)
```

### Modify Schema (DDL)

```
# Use apply_migration for DDL operations
mcp_supabase-mcp-server_apply_migration(
  project_id="clsnlzalhiyrkfygpfvp",
  name="add_column_to_legal_references",
  query="ALTER TABLE legal_references ADD COLUMN category text;"
)
```

### Insert Data

```
mcp_supabase-mcp-server_execute_sql(
  project_id="clsnlzalhiyrkfygpfvp",
  query="INSERT INTO legal_references (title, source_type, ...) VALUES (...);"
)
```

### Check Security

```
# Always run after DDL changes
mcp_supabase-mcp-server_get_advisors(project_id="clsnlzalhiyrkfygpfvp", type="security")
```

### Get API Keys

```
mcp_supabase-mcp-server_get_publishable_keys(project_id="clsnlzalhiyrkfygpfvp")
```

## Important Notes

- Use `execute_sql` for DML (SELECT, INSERT, UPDATE, DELETE)
- Use `apply_migration` for DDL (CREATE, ALTER, DROP) — this creates a versioned migration
- Always check `get_advisors` after schema changes for missing RLS policies
- The project uses RLS — both tables have policies enabled
