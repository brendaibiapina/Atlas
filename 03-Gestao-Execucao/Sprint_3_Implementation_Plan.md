# Implementation Plan - Sprint 3: Specialized Modules

**Goal:** Implement the "Imobiliário" niche module and the "Timeline" visual tool.

## Proposed Changes

### 1. Real Estate Module (`src/app/dashboard/imobiliario/`)
*   **[NEW] `page.tsx`**:
    *   Header "Módulo Imobiliário".
    *   **Rate Cards**: Comparison cards (ITBI Current vs IBS/CBS Projected).
    *   **Operation Filter**: Tabs for "Compra/Venda", "Locação", "Incorporação".
    *   **Sector News**: A filtered version of the radar specifically for real estate tags.

### 2. Timeline Visualization (`src/app/dashboard/timeline/`)
*   **[NEW] `page.tsx`**:
    *   Vertical timeline component.
    *   Groups events by Month/Year.
    *   Visual distinction between "Past" (faded), "Current" (highlighted), and "Future" (dashed).

### 3. Alert Templates (Email)
*   **[NEW] `src/lib/email-templates.ts`**:
    *   HTML strings for `WelcomeEmail`, `AlertImmediate`, and `WeeklyDigest`.

## Verification Plan

### Manual Verification
1.  **Imobiliário Page**: Navigate to `/dashboard/imobiliario`.
    *   Verify "Alíquotas de Referência" cards are visible.
    *   Test switching tabs (Compra/Venda -> Locação).
2.  **Timeline Page**: Navigate to `/dashboard/timeline`.
    *   Verify events are sorted chronologically.
    *   Check for "Início da Cobrança Teste" (Jan 2026).
