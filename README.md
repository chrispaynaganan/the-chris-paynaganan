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

## Studio (the CMS)

`/studio` is a Monday.com-style editor for everything on the site, for one person: Chris.
Boards: **Projects**, **Inquiries** (contact + project form messages), **Business**, **Site & About**.

### Setup (once)
1. `npm install`
2. Supabase (the same project as the old site) → **SQL Editor**: run `supabase/0001_studio.sql`, then `supabase/0002_seed.sql`.
   New tables are prefixed `studio_`; the old `cms_*` tables are untouched; `inquiries` only gains columns.
3. Supabase → **Authentication → Users → Add user**: `mark.payns@gmail.com` with a password (auto-confirm).
   Then **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
4. `.env.local` holds the Supabase and Resend settings (see `.env.example`). Add the same to Vercel.
5. `npm run dev` → http://localhost:3000/studio

### How it works
- Only the owner email can sign in or edit. It's set in two places: `studio_is_owner()` in
  `supabase/0001_studio.sql` and `STUDIO_OWNER_EMAIL` in `lib/supabase/env.ts`.
- Saving in Studio refreshes the public pages right away (and every 5 minutes as a fallback).
- If Supabase isn't set up or a table is empty, the site falls back to the files in `/content`.
- Re-create the seed from the content files with `npm run seed`.
