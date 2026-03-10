# Card Hover State Design

**Date**: 2026-03-10

## Summary

Add hover state to all `Card` components across the admin system (7 apps).

## Requirements

- **Scope**: All cards — stats cards, filter containers, table containers, chart/content cards
- **Effect**: Shadow lift — shadow deepens + ring brightens on hover
- **No layout shift**: transition limited to `box-shadow` only

## Implementation

Modify the `Card` base class in all 7 `card.tsx` files:

```diff
- "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card ... ring-1 ring-foreground/10 ..."
+ "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card ... ring-1 ring-foreground/10 transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20 ..."
```

### Classes added

| Class | Effect |
|---|---|
| `transition-shadow` | Smooth transition for `box-shadow` (covers both shadow and ring, both use box-shadow internally) |
| `duration-200` | 200ms — appropriate for larger UI elements |
| `hover:shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` on hover |
| `hover:ring-foreground/20` | Ring opacity: 10% → 20% on hover |

## Files

- `admin/main/src/components/ui/card.tsx`
- `admin/apps/basic/src/components/ui/card.tsx`
- `admin/apps/securities/src/components/ui/card.tsx`
- `admin/apps/cms/src/components/ui/card.tsx`
- `admin/apps/crm/src/components/ui/card.tsx`
- `admin/apps/service/src/components/ui/card.tsx`
- `admin/apps/operations/src/components/ui/card.tsx`
