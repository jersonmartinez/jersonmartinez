# Portfolio integrity, experience and security refresh

## Scope

This iteration aligns the Astro portfolio with the current Spanish and English
CVs, public GitHub metadata, OpenWebinars and values confirmed directly by
Jerson. It improves content integrity, recruiter and consulting journeys,
accessibility, performance, SEO, security and CI.

## Content integrity

- Professional experience uses a single `yearsExperience: 10` value.
- The public timeline starts with independent technical projects in 2016 and
  continuous learning since December 2017, without naming unpublished clients.
- The detailed employment timeline follows the current bilingual CV.
- GitHub Foundations is the only GitHub certification. GitHub Actions and
  repository governance remain professional competencies.
- OpenWebinars is split into more than 60 published articles and seven courses
  taught. More than 100 certifications describe learning completed as a
  student, not official vendor badges displayed by the site.
- Infralytics is described only at the level authorized by Jerson: a Python web
  system used to execute operational actions on Windows and GNU/Linux servers.
- Factib remains a product project and links to its user-provided domain.
- Audience metrics include a `lastVerifiedAt` value.
- WSL Container replaces the ambiguous `WSLC` label.

## Experience and design

- The home offers separate paths for professional opportunities, consulting and
  training.
- Skills combine tools, an applied narrative and links to relevant evidence.
- Project cards present problem, contribution, result, role and public GitHub
  metadata when available.
- Courses form a progressive route and use richer, data-driven SVG visuals.
- The OpenWebinars section uses seven public course links and published
  durations.
- Certification badges show provider, level, code and credential ID, each linked
  to the official verification source.
- CV links remain available through Google Drive and as local downloadable PDFs.
- A custom 404 page keeps navigation useful.

## Accessibility

- The mobile menu traps focus, restores it on close and makes the document inert
  while open.
- The menu remains usable without JavaScript.
- Skills support click, arrow keys, Home and End.
- Project filter state is shareable through the query string.
- `prefers-reduced-motion`, `prefers-contrast` and forced-colors are supported.
- Non-interactive cards no longer imply clickability through hover elevation.
- Inline styles and executable inline scripts were removed.

## Performance

- The profile image is generated at 320, 640 and 960 pixels in AVIF, WebP and
  optimized JPEG.
- Page-specific 1200×630 Open Graph cards are generated for all public pages and
  the 404 page.
- Manrope and DM Mono are self-hosted.
- Font Awesome is reduced to a small CSS subset and the two required WOFF2 files.
- Remote technology logos are stored locally.
- Unused Bootstrap, jQuery, duplicate Font Awesome formats and legacy images
  were removed from `src/`.
- Vercel caches only versioned/generated assets as immutable.

Assets can be regenerated with:

```bash
python3 tools/generate-visual-assets.py
```

The generator requires Pillow with WebP and AVIF support.

## SEO and security

- Open Graph cards are page-specific and use 1200×630 PNG images.
- JSON-LD includes `WebSite`, `ProfilePage`, `ItemList`, `Course` and
  `EducationalOccupationalCredential` where relevant.
- The email address is no longer exposed in JSON-LD.
- The sitemap includes `lastmod`.
- Vercel canonicalizes clean and trailing-slash route variants.
- CSP uses no `unsafe-inline`; scripts, styles, fonts, logos and images are
  served from the same origin.
- HSTS, nosniff, framing protection, permissions and referrer policies are
  declared in `vercel.json`.

See `SECURITY-HEADERS.md` for hosting details.

- Pa11y 9.1 uses its bundled axe 4.11 for structural WCAG checks. Its legacy
  `color-contrast` rule is excluded because it reports false positives on solid
  inherited backgrounds; Playwright runs axe-core 4.13 separately on every
  route and fails on any modern WCAG/contrast violation.

## CI gates

- External links are checked with redirects, retries, timeouts and explicit
  blocked/unverifiable classifications.
- Compiled HTML tests run after `npm run build` with `VALIDATE_BUILD=1`.
- Lighthouse, pa11y and Playwright run as pull-request gates.
- E2E covers the mobile menu, skill tabs, project filters, hash navigation and
  keyboard focus.
- Metadata, JSON-LD, security headers, sitemap synchronization and the custom
  404 are validated.
- TLS checks block only certificates controlled by the portfolio.

## LinkedIn recommendations

LinkedIn returned its anti-automation status (`999`) and did not expose
recommendation author, portrait, text or a stable direct recommendation URL.
No testimonial was copied or inferred. Recommendations should only be added
when Jerson provides a LinkedIn export, direct public URLs or screenshots with
publication permission.
