---
description: How to use Stitch MCP (Google) for UI design generation and iteration
---

# Stitch MCP — UI Design Tool

Stitch is Google's AI-powered UI design tool, available via MCP. Use it to generate, edit, and iterate on screen designs for the ATLAS project.

## When to Use

- **New page design** → User asks to create a new page or screen
- **UI iteration** → User wants to change the look/layout of an existing screen
- **Design variants** → User wants to explore different visual approaches
- **Mobile/desktop adaptation** → Need to create responsive versions

## Project Context

The ATLAS project in Stitch should always use:
- **Device type**: `DESKTOP` (primary), `MOBILE` (for responsive)
- **Style**: Modern, clean, professional — dark sidebar with white content area
- **Colors**: Gray sidebar, white cards, blue accents, green/yellow/red status badges

## Workflow

### 1. Create or Find the Stitch Project

```
# List existing projects
mcp_StitchMCP_list_projects

# Or create a new one
mcp_StitchMCP_create_project(title="ATLAS Reforma Tributária")
```

### 2. Generate a Screen from Text

```
mcp_StitchMCP_generate_screen_from_text(
  projectId="<project_id>",
  prompt="Dashboard with sidebar navigation, reform status cards for CBS/IBS/IS, and a news feed section",
  deviceType="DESKTOP"
)
```

### 3. Edit an Existing Screen

```
# First, list screens to get IDs
mcp_StitchMCP_list_screens(projectId="<project_id>")

# Then edit
mcp_StitchMCP_edit_screens(
  projectId="<project_id>",
  selectedScreenIds=["<screen_id>"],
  prompt="Change the sidebar color to dark gray and add a logout button"
)
```

### 4. Generate Variants

```
mcp_StitchMCP_generate_variants(
  projectId="<project_id>",
  selectedScreenIds=["<screen_id>"],
  prompt="Create alternative layouts",
  variantOptions={"numVariants": 3}
)
```

## Prompt Best Practices

When generating screens for ATLAS, include these details:
- **Sidebar**: Dark gray sidebar with navigation items: Visão Geral, Obrigações 2026, Radar Oficial, Timeline, Imobiliário
- **Header**: "ATLAS Reforma Tributária" branding
- **Language**: All UI text in Portuguese (pt-BR)
- **Status badges**: Use green for VIGENTE, yellow for EM_CONSTRUCAO, blue for EDUCATIVO, gray for FUTURO
- **Data context**: Tax reform (IBS, CBS, IS), legal references, obligations

## Important Notes

- Screen generation can take a few minutes. **Do NOT retry** if it seems slow.
- If the tool call fails due to connection error, the process may still succeed — use `get_screen` to check later.
- If `output_components` contains suggestions, present them to the user and use their choice as the next prompt.
