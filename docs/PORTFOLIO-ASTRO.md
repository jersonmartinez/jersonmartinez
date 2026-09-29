# Portfolio architecture

## Framework choice

The portfolio uses **Astro 5** with static output. This fits a profile site hosted on Vercel/GitHub Pages because the rendered pages are fast, crawlable and dependency-light, while focused client scripts add only the interactions that matter: ordered navigation, responsive menu, project filters and the skills explorer.

## Route map

- `/` — ordered presentation: impact, skills, systems, teaching, credentials and contact.
- `/projects.html` — personal products, public repositories and a filterable project index.
- `/courses.html` — seven Udemy courses, student total and YouTube channels.
- `/certifications.html` — AWS, Microsoft Azure and GitHub credentials with official local logo assets.
- `/experience.html` — CV-backed professional timeline.

The `.html` suffix is intentionally preserved for existing links and bookmarks while the implementation is under `src/pages/*.astro`.

## Brand and icon system

- `public/brand/logo.svg` is the simplified horizontal **Jerson + terminal dot** wordmark; the isotipo was removed from the header.
- `public/brand/favicon.svg` is the compact J-and-dot favicon.
- `public/images/profile.jpg` is the public profile image used by the site.
- The site uses the repository's local **Font Awesome 5.9** assets as its single reusable UI icon library. Header actions, navigation entries, CTA buttons, social links, tooltips, skill categories and external-link affordances all use the same icon system.
- `public/brands/aws.svg`, `public/brands/azure.svg`, `public/brands/github.png` and `public/brands/openwebinars.svg` remain provider/content logos, separate from UI iconography.

## CV-driven content

Content in `src/data/portfolio.js` is restricted to information confirmed in the supplied updated Spanish/English CVs, the public GitHub profile and the existing README:

- Hero facts now show `+10` years of experience, `3` Cloud Providers, `100+` courses and certifications, and `60+` published articles, following the requested presentation copy.
- `skills` contains the updated CV taxonomy: infrastructure, cloud, virtualization, containers, IaC, DevOps/CI/CD, observability, storage/backup, security/governance, generative AI, development, databases and languages.
- The home page renders those categories through `SkillsExplorer.astro`, with click, arrow-key, Home and End navigation and ARIA tab/tabpanel state.
- Factib and Crashell are presented as personal products.
- `mcp-github-projects`, `mcp-monday-projects`, `kiro-crew`, `InfraQuiz`, `GNet`, `reusable-workflows`, `DevOps-YouTube-Channels` and `docker-lamp` link to public repositories confirmed on the GitHub profile.
- Udemy, DevOpsea, Side Master and OpenWebinars are shown as teaching/content work. The Udemy catalog contains 7 courses and more than 77 thousand students; DevOpsea uses more than 15K subscribers and Side Master keeps its independent rounded public figure.
- AWS, Microsoft Azure and GitHub verification links are extracted from the updated PDF annotations and remain public per credential.
- Factib has no public repository link in the consulted profile, so the portfolio does not invent one.
- Certification names and professional metrics are marked as CV-based; they are not presented as independently verified by this site.

## Local workflow

```bash
npm ci
npm run dev
npm run build
npm test
npm run validate
npm run links
```

The GitHub Actions validation workflow builds `dist`, validates the generated assets and checks local links. The deployment workflow publishes only `dist`; it never uploads the source tree as the site artifact.
