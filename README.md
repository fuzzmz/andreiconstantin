# Andrei Constantin — portfolio

A responsive static gallery of Andrei Constantin’s paintings, built for GitHub Pages and a custom domain. Includes subject filters, a keyboard- and touch-accessible artwork viewer, biography, résumé and direct contact links. The gallery is generated into HTML so all artwork remains available when JavaScript is disabled.

English is available at `/` and Romanian at `/ro/`, with an EN/RO switch in the header. Both versions work without JavaScript for reading and browsing, share the same optimized images, and have their own canonical URLs and language metadata. The original résumé image remains in English and is labelled accordingly on the Romanian page.

## Continue on another computer

Install Node.js 22 or newer, clone the repository, then run:

```sh
npm ci
npm run build
npm run check
npm run dev
```

Open `http://127.0.0.1:4173/`. The preview serves `dist/`; rebuild and refresh after editing. No secrets, environment variables, database, or server hosting are needed. Google Fonts is optional: system serif and sans-serif fallbacks work offline.

`npm run check` validates the generated catalogue, asset links and image metadata, then exercises filtering, pagination and viewer controls with a lightweight DOM fixture. It does not replace visual checks in desktop and mobile browsers.

## Files to edit

- `PLAN.md`: implementation decisions, progress and handoff.
- `index.html`: page template, biography, contact details and metadata.
- `ro/index.html`: Romanian page template, translated navigation, biography, controls and metadata. Use `../` for shared asset links and keep section links as local fragments.
- `styles.css`: layout, colours, typography and mobile styling.
- `app.js`: subject filters, progressive collection reveal, artwork viewer, keyboard and swipe controls.
- `data/artworks.json`: ordered `[source filename, descriptive caption, subject]` entries. The first image is featured in the hero.
- `data/artworks.ro.json`: Romanian captions keyed by the exact original filename. Category translations live in `scripts/build.mjs`; internal category keys remain the same in both languages.
- `assets/paintings/`: untouched original photographs and résumé.
- `scripts/build.mjs`: reproducible image optimization and HTML generation.
- `.github/workflows/pages.yml`: build, validate and deploy on pushes to `main`, or manually from Actions.

## Content notes

Captions are descriptive labels, not verified artwork titles. Categories describe visible subjects; individual media, artwork dates and sizes are deliberately not inferred. The résumé mentions oils and pastels but does not identify each photograph’s medium. Several photographs are alternate views or details of the same artwork; they remain included and are labelled accordingly. Biography and contact details were transcribed from the supplied résumé; confirm they remain current before launch.

The two `.dng` RAW photographs are preserved but excluded because browsers cannot display them directly. Export them to JPEG and add entries to include them. All 107 JPEG photographs are included. `resume.png` is available separately.

## Add or update artwork

1. Add a JPEG or PNG to `assets/paintings/`.
2. Add a matching entry to `data/artworks.json` and a Romanian caption in `data/artworks.ro.json`. Use an existing subject: `Landscapes`, `Still life`, `Places`, `Figures & portraits`, or `Sacred & symbolic`.
3. Run `npm run build` and `npm run check`. The check requires every compatible original to have exactly one catalogue entry.
4. Commit the original, catalogue edit and any code changes. Generated `dist/` stays untracked.

Images are automatically oriented using EXIF and resized to 800px and 1600px WebP versions without upscaling. Original files are never modified. The build strips embedded metadata from the published images and publishes only the optimized site, rather than the original collection. Artwork is displayed without cropping. The original résumé remains a direct image link.

## Publish with GitHub Pages

1. Push these files to the configured repository, [`fuzzmz/andreiconstantin`](https://github.com/fuzzmz/andreiconstantin), on its `main` branch, including the original assets and `package-lock.json`.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Run the **Deploy portfolio to GitHub Pages** workflow, or push to `main`. The successful deployment displays the site URL.
4. If the default branch has another name, update the workflow’s `branches` list.

The site uses relative local asset paths so it works at both `https://fuzzmz.github.io/andreiconstantin/` and the custom-domain root. Canonical and Open Graph URLs point to `https://andreiconstantin.com/`.

## Custom domain

The domain is **andreiconstantin.com**. The root `CNAME` file records it and is copied into the build. Complete these hosting settings:

1. In the repository’s **Settings → Pages → Custom domain**, enter `andreiconstantin.com`. Verify domain ownership in GitHub where available, then configure DNS.
2. With this GitHub Actions workflow, GitHub manages the custom domain in repository settings; a `CNAME` file is not required and does not configure the domain. The build also supports copying a root `CNAME` file for a future switch to publishing from a branch.
3. Enable **Enforce HTTPS** once GitHub issues the certificate.
4. Check `https://andreiconstantin.com/` after deployment and DNS propagation.

Use these DNS records at the registrar; `@` means the root domain:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | fuzzmz.github.io |

The `www` record is optional and allows GitHub to redirect `www.andreiconstantin.com` to the primary domain. The apex domain uses A records, not a DNS CNAME record. Existing conflicting website records should be replaced; retain unrelated email records.

Repository/account settings and DNS must be configured by someone with access to the GitHub repository and domain registrar. The local build does not change those settings or publish anything by itself.

Official references: [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [custom domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
