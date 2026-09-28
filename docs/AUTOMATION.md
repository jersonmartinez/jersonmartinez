# Automation and operations

This repository is a static portfolio plus a GitHub profile README. The automation is intentionally dependency-light: runtime scripts use Node.js 20 built-ins, while CI-only tools are version-pinned in workflow commands.

## YouTube synchronization

`src/js/update-youtube-sections.js` reads `config/youtube-channels.json` and updates only the marked video tables in `README.md`.

Source priority is:

1. YouTube Data API, when `YOUTUBE_API_KEY` is configured.
2. The public channel videos page, with oEmbed author verification.
3. YouTube RSS, for channels where the page is temporarily unavailable.
4. `data/youtube-state.json`, the last valid cache, without replacing good README content with an empty result.

The synchronizer provides request timeouts, exponential retries for transient HTTP errors, response validation, title normalization, HTML escaping, channel isolation, duplicate removal, result limits, error classification, SHA-256 change detection, atomic writes and a GitHub Step Summary. Run it locally with:

```bash
npm test
npm run validate
npm run links
npm run youtube:dry-run
node src/js/update-youtube-sections.js --dry-run --channel DevOpsea --limit 3
```

The scheduled workflow creates a normal, reviewable PR instead of pushing to `main`. `workflow_dispatch` supports a channel, limit and dry-run mode. A YouTube API key is optional; add it as the repository secret `YOUTUBE_API_KEY` to use the official API first and reduce scraping risk.

## Quality gates

- `.github/workflows/validate.yml` runs JavaScript syntax checks, unit tests, local resource/link validation, offline generator validation, Markdown lint and Actionlint.
- `.github/workflows/external-links.yml` runs weekly and on demand, audits external URLs with timeout/retries and uploads `link-report.json` for 14 days.
- `.github/workflows/preview.yml` crea un artefacto descargable por PR para inspeccionar el sitio sin publicarlo.
- `.github/workflows/site-quality.yml` ejecuta Lighthouse y Pa11y semanalmente contra un servidor local efímero y conserva sus reportes.
- `.github/workflows/content-health.yml` alerta cuando el caché de YouTube supera 45 días o queda vacío; el límite se puede cambiar con `MAX_CONTENT_AGE_DAYS`.
- `.github/workflows/certificates.yml` revisa semanalmente la expiración TLS de los dominios externos; `TLS_MIN_DAYS` define el umbral de alerta.
- `tools/check-links.js` también produce un inventario JSON de URLs, útil para revisar enlaces externos y certificados antes de modificar contenido.
- `tools/validate-site.js` comprueba las cuatro páginas HTML, metadatos, recursos locales, marcadores del README, CNAME, robots y sitemap.
- `tests/` usa fixtures locales para que el parser sea comprobable sin depender de la disponibilidad de YouTube.
- `.github/dependabot.yml` mantiene actualizados GitHub Actions y el metadata de npm.

## Deployment and discoverability

`.github/workflows/deploy-pages.yml` validates the site, uploads the repository as a Pages artifact and deploys it with least-privilege `pages: write` and `id-token: write` permissions. `CNAME`, `.nojekyll`, `robots.txt` and `sitemap.xml` are checked before deployment.

The deployment requires GitHub Pages to use **GitHub Actions** as its source and a `github-pages` environment. The domain in `CNAME` is the source of truth for the sitemap and robots file.

## Operating model

- Generated content is isolated to README video markers and the state cache.
- A failed source is reported with its category; successful channels remain independently processable.
- No workflow writes directly to `main`; branch protection can therefore require the validation workflow and human review.
- External audits are informational until reviewed; a broken third-party URL must be confirmed before changing product content.
- The repository intentionally does not fabricate testimonials, subscriber counts, publication dates or future features.
