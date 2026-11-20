# the-chris-paynaganan

Chris Paynaganan's portfolio: an Airbnb-style site where projects are listings,
case studies are diary entries, and every industry worked in earns a passport stamp.

## Run it

```bash
npm install
npm run dev
```

## Where things live

| What | Where |
| --- | --- |
| Project write-ups (diary entries, facts, stats, links) | `content/projects.ts` |
| Bio, tools, testimonials, bundles, add-ons, FAQ, socials | `content/site.ts` |
| Passport stamp areas | `content/stamps.ts` |
| Content shapes (also the future CMS schema) | `types/content.ts` |
| The only place pages read content from | `lib/content.ts` |

Pages never import from `content/` directly. When the CMS is built, `lib/content.ts`
switches to reading the database and nothing else has to change.

### Adding a project (until the CMS exists)
Add an entry to `content/projects.ts`. List the stamp ids it earns in `stamps`;
a stamp area with no project shows as a dashed "next stop".

### Docs and design-system links
Set `docsUrl` / `designSystemUrl` on a project. Until then, the buttons show a
blue "coming soon" message.

## Design rules
- Black on white. Color only for status: green ok, blue info, yellow warning, red error.
- Buttons: primary = filled black, secondary = black outline, tertiary = underlined
  (`buttonClass()` in `components/ui/button.ts`).
- Tailwind: canonical classes only (spacing scale + tokens in `app/globals.css`), no arbitrary values.

## Routes
`/` projects · `/projects/[slug]` project page · `/gallery` · `/about` · `/business` (Chris for Business)
· `/privacy-policy` · `/terms-and-conditions`
