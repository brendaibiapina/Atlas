# Implementation Plan - Sprint 2: Core Features

**Goal:** Implement the authenticated area (Dashboard) and the Obligations Checklist.

## Proposed Changes

### 1. UI Components (`src/components/ui/`)
*   **[NEW] `Badge.tsx`**: Component to display status tags (VIGENTE, EDUCATIVO, etc.) with appropriate colors.
*   **[NEW] `Card.tsx`**: Container component with consistent styling (white bg, shadow, border).
*   **[NEW] `Button.tsx`**: Reusable button component (primary/secondary/ghost).

### 2. Dashboard Layout (`src/app/dashboard/`)
*   **[NEW] `layout.tsx`**:
    *   Sidebar navigation (Home, Obrigações, Timeline, Radar).
    *   Header with User Profile (Mocked).
    *   Protected route wrapper (Mocked auth check).

### 3. Dashboard Home (`src/app/dashboard/page.tsx`)
*   **[NEW] `page.tsx`**:
    *   **Status Widget**: Summary of IBS/CBS status.
    *   **Updates Feed**: List of recent "LegalReferences" (Mocked data).
    *   **Quick Actions**: Shortcuts to other modules.

### 4. Obligations Checklist (`src/app/dashboard/obrigacoes/page.tsx`)
*   **[NEW] `page.tsx`**:
    *   Table listing `Obligations`.
    *   Filters: Status (All, Vigente, Educativo).
    *   Mock data integration (based on `seed.sql`).

## Verification Plan

### Manual Verification
1.  **Dashboard Access**: Navigate to `/dashboard`.
    *   Verify Sidebar presence and navigation links.
    *   Verify "Status da Reforma" widget visibility.
2.  **Obligations Page**: Navigate to `/dashboard/obrigacoes`.
    *   Verify table renders Mock Data.
    *   Test Status badges colors (Red for Vigente, Yellow for Educativo).
    *   Test switching tabs/filters.
