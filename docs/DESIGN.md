# Chris Paynaganan — design system

The portfolio borrows Airbnb's **structure** (listing grid, search pill, listing-detail
layout, one shadow, soft corners) and keeps its **own identity**. `airbnb-reference.md`
in this folder is reference only: never take its font, Rausch red, ink #222 or copy.

Tokens live in `app/globals.css`. Buttons live in `components/ui/button.ts`.

## Ours: never change these to match Airbnb

| | Rule |
|---|---|
| Font | **Livvic**, weights 400 / 500 / 600 only. Never bold. Small text (≤16px) is regular or medium; headings are semibold at most. No serif, no italics. |
| Color | Black `#000` on white `#fff`. Color only for status: green ok `#14632f`, blue info `#1d3f99`, yellow warning `#7a4a03`, red error `#b42318`. Greys only for lines, muted text and placeholders. |
| Voice | Project write-ups read like diary entries, first person ("Dear diary, March 2026…"). Each project shows only the gist of each stage: Overview, Context & challenge, Approach, Outcome, Reflection. |
| Content | Everything comes from `lib/content.ts` (files in `/content`, later the CMS). No invented stats, quotes or claims. |
| Name | The site is only ever "Chris Paynaganan". Business section: "Chris for Business". Footer link "Chris Enterprise" → ohyvi.com. |
| Line height | `normal` everywhere (Figma's Auto). |
| Buttons | 40px tall. Primary = filled black, secondary = black outline, tertiary = underlined text. On black: inverted. |
| Header | 56px. |
| Layout | One container: max 1512px, side gutter `clamp(24px, 5.29vw, 80px)` (80px at a 1512px window). Classes: `max-w-site px-gutter`. |
| Corners | iOS-style squircles (`corner-shape: squircle`) where supported; radius scale bumped ~1.3× there. |
| Tailwind | Canonical classes only: spacing scale and named tokens, no arbitrary `[...]` values. |

## Borrowed from Airbnb (structure)

| | Rule |
|---|---|
| Elevation | One shadow tier, `shadow-float`: search bar, cards on hover, menus, dialogs, toasts. Everything else is flat. |
| Radius by role | Buttons and inputs `rounded-lg` (8px) · cards, photos, side cards `rounded-card` (14px) · large panels `rounded-panel` (20px) · pills, chips, avatars `rounded-full`. |
| Type sizes | Modest. Home h1 ~28px, project title 24px medium, section heads 20px semibold. Photography (screenshots) carries the weight, not type. |
| Spacing | 4px base. 16px between cards in a grid, 64px between major page sections. |
| Search | Pill search bar with segments (Search / Role / Years) ending in a round black search button; collapses into a compact pill in the header when scrolled past. |
| Listing cards | Photo-first, screenshot carousel with dots, status badge top-left, meta lines below. |
| Listing detail | Two columns: story on the left, sticky "Explore the work" card on the right; on phones it becomes a bottom bar. |
| Footer | White, full width, hairline on top, link columns, quiet 13px legal line (`text-caption`). |
| Forms | 8px inputs; focus darkens the border to ink with no glow. |
| Modals | Black scrim at 50%. |

## Business page exceptions

"Chris for Business" is the one dark surface: black page, white text, the React Bits glow
cursor behind the content and pixel cards for the bundles (`components/reactbits/`).
Status colors still mean the same thing there.
