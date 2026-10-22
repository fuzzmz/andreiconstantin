# Andrei Constantin portfolio — implementation plan

## Goal and hosting

Build a responsive, accessible art portfolio from `assets/paintings/`, using the supplied résumé as the source for biographical facts. Deliver a static website compatible with GitHub Pages at either a custom-domain root or a repository subpath. Keep original artwork files intact.

## Implementation checklist

- [x] Review the résumé and make contact sheets of all browser-compatible artwork images.
- [x] Curate descriptive image labels and subject categories. Do not invent official titles, dates, dimensions, or media. Use subject categories where oil/pastel/charcoal cannot be verified visually.
- [x] Build a warm, restrained gallery design with a featured artwork, responsive collection, category filters, accessible full-screen artwork viewer, biography, résumé, and contact links.
- [x] Generate optimized responsive artwork assets and a data manifest reproducibly from the originals.
- [x] Add static build/validation commands and GitHub Actions deployment for GitHub Pages. Document local use, content updates, and custom-domain setup.
- [x] Run production validation, check every image reference, and verify interactions as available.
- [x] Record the final state, completed checks, and any remaining account/domain setup below.

## Decisions and constraints

- Use HTML, CSS, and browser JavaScript; no server or framework is needed on GitHub Pages.
- Use relative asset paths so the site works on a custom domain and under a repository name.
- Contact and career details come from `assets/paintings/resume.png`.
- Keep original source photography, including RAW files, out of the deployed site; publish optimized derivatives. RAW images may need separately exported JPEGs before inclusion.
- Do not publish to a different hosting provider. Domain and GitHub account settings will be documented if they cannot be configured locally.

## Continuation notes

Implemented on 22 October 2026. See `README.md` for local commands, content updates and deployment instructions.

### Delivered

- Static HTML/CSS/JavaScript site with 107 labelled artwork photographs across five subject categories. All original assets remain untouched.
- Responsive gallery with 18-image progressive reveal, lazy-loaded thumbnails, native modal viewer, arrow navigation, touch swipes and focus restoration. All images remain in the generated HTML without JavaScript.
- Biography, exhibitions and education based on the résumé, plus résumé access and email/telephone links.
- Reproducible Node build with Sharp, metadata stripping, WebP derivatives and a generated catalogue. Published derivatives total about 48.5 MB; all thumbnails total about 8 MB, with the initial 18 totalling about 1.4 MB. Larger images load when opened.
- GitHub Actions workflow builds, checks and deploys only `dist/`. Works on custom domains and repository subpaths.

### Validation completed

- `npm run build`: successful with Sharp 0.35.5.
- `npm run check`: passed source coverage, unique catalogue entries, WebP formats, metadata removal, local references, unique HTML IDs, anchors and template replacement.
- Interaction checks passed for every category, progressive reveal, viewer navigation, keyboard arrows, touch swipe, focus restoration and opening the hero while a different gallery filter is selected. These use a lightweight DOM fixture; no visual browser or real-device testing was performed.
- HTTP preview checks returned 200 for the page, stylesheet, script, artwork and résumé; missing resources returned 404.
- Dependency installation audit: zero reported vulnerabilities.

### Romanian version

- Added a complete static Romanian page at `/ro/` and reciprocal EN/RO header links. English remains at `/`.
- Translated page content, all 107 artwork captions, categories, accessibility labels, result counts and viewer controls. The supplied résumé remains in English and its Romanian link says so.
- Both versions share optimized image assets; relative paths also support repository subpaths. Each page has its own canonical URL and reciprocal `hreflang` metadata.
- Romanian captions are maintained in `data/artworks.ro.json`, keyed by source filename. The build rejects missing translations. Add a Romanian entry whenever adding a new artwork.
- Adjusted Romanian heading sizes for the longer wording and allowed the mobile navigation to wrap.
- Refined the EN/RO switcher after a Firefox mobile report: equal-width language cells with explicit shared alignment, line height and spacing, and a filled high-contrast selected state. Verification uses automated checks; Firefox on the actual Pixel device still needs confirmation after deployment.
- Extended validation and interaction checks to cover both languages, translated captions/counts and Romanian image paths.
- `npm run build` and `npm run check` passed for both languages, including translation coverage, metadata, asset links and gallery interactions. No visual browser or real-device testing was performed for this change.

### Launch configuration

- Git remote `origin` is configured as `https://github.com/fuzzmz/andreiconstantin.git`, and the local branch is `main`. Source files still need to be committed and pushed.
- Enable GitHub Actions as the Pages publishing source and run the included deployment workflow.
- The user supplied `andreiconstantin.com`. Added root `CNAME`, the canonical URL, Open Graph URL, and repository-specific DNS instructions in `README.md`. Configure that domain in GitHub Pages and at the DNS provider, then enable HTTPS. Local files do not change account or DNS settings.
- Optional: review the descriptive captions with Andrei, replace them with verified titles/media/dimensions, export the two RAW `.dng` sources to JPEG, and remove unwanted alternate photographs.
- Recommended before launch: check the finished layout in desktop and mobile browsers and confirm that the résumé’s contact information is still current.
