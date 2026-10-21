# Doclap

[![CI](https://github.com/miketropi/doclap/actions/workflows/ci.yml/badge.svg)](https://github.com/miketropi/doclap/actions/workflows/ci.yml)

An editorial portfolio theme for WordPress: a child theme of **[Nextora](https://github.com/miketropi/nextora)** where every surface — home, about, contact, FAQ, notes archive, note detail, search, 404 — is composed from Doclap's own dynamic blocks instead of hard-coded templates. Content stays in the block editor; markup, behaviour and typography stay in this repository.

<p align="center">
  <a href="https://pub-0645c3b9d3674132af6b362484df0f3c.r2.dev/Nextora/doclap/doclap-preview-image.png">
    <img src="https://pub-0645c3b9d3674132af6b362484df0f3c.r2.dev/Nextora/doclap/doclap-preview-image.png" alt="Doclap — full-page preview of the home surface" width="440">
  </a>
</p>

- **26 dynamic blocks**, one `render.php` each, all server-rendered.
- **Scoped CSS** compiled from five ordered modules into `assets/css/app.css`.
- **A small TypeScript runtime** (`assets/js/main.js`) plus per-block view scripts.
- **Zero page builders, zero ACF, no icon fonts** — icons are inline SVG paths.

## Stack

| | |
|---|---|
| WordPress | 7.0 or newer (tested on 7.0) |
| PHP | 8.1 or newer (`declare(strict_types=1)` everywhere) |
| Parent theme | `nextora` (required — Doclap only overrides) |
| Node | 24 (`.nvmrc`), npm |
| CSS build | PostCSS + Tailwind v4 → `assets/css/app.css`, `assets/css/editor.css` |
| JS build | esbuild → `assets/js/main.js`, `blocks/*/index.js`, `blocks/*/view.js` |
| PHP tooling | PHPStan level 8, PHP-CS-Fixer, PHPUnit |

## Install

From a checkout inside `wp-content/themes/`:

```bash
git clone https://github.com/miketropi/doclap.git doclap
cd doclap
npm install
composer install          # PHPStan, PHP-CS-Fixer, PHPUnit
npm run build             # styles, runtime and block bundles
```

Then activate **Doclap** in *Appearance → Themes*. Nextora has to be present; Doclap declares `Template: nextora` and refuses to run without it.

The compiled artefacts under `assets/` and `blocks/*/{index,view}.js` are committed, so a site that only deploys files still needs no build step — run `npm run build` after any change under `resources/` or `blocks/*/`.

## Content setup

Activating Doclap creates, modifies and deletes nothing. To get the reference site, an editor sets up:

1. **Settings → Reading** — a static front page. Any page works: the front page template renders the nine `doclap/home-*` section blocks in landing order.
2. **Three pages**, each assigned the matching template in the page sidebar (Appearance → Editor → Templates):

   | Page slug | Template |
   |---|---|
   | `about-us` | About Us |
   | `contact` | Contact Us |
   | `faq` | Frequently Asked Questions |

   Those template names are registered by Nextora; Doclap supplies `templates/*.html` files that override the parent's files for the same names.
3. *Optional* — a posts page, if the notes archive should live at a path such as `/notes/`. Header and footer link to it through the `@notes` token, which resolves to the page set as "Posts page" (or the site home when none is set).

## Templates and the Site Editor

`templates/front-page.html` is the canonical composition: one block per landing section, in order, inside the shared `main` group. A template customised in the Site Editor is stored as a `wp_template` override in the database and **always wins** over the theme file, so those edits survive theme updates — and a theme-file change does not reach a site that has overridden that template.

The child `theme.json` deliberately declares no `customTemplates` of its own: that setting merges positionally between parent and child, so redeclaring it in Doclap would silently drop entries Nextora registers.

Section anchors — `#work`, `#about`, `#process`, `#team`, `#testimonials`, `#journal`, `#contact` — come from each section block's own anchor field. Change one in the editor and the header, footer and call-to-action links that point at it need the same change.

## Project layout

```
blocks/<name>/            one dynamic block each
  block.json              the public contract: attributes, supports, assets
  render.php              server-side markup (the source of truth)
  edit.tsx                editor UI (inspector + preview)
  types.ts                attribute types, mirrored from block.json
  view.ts                 optional front-end behaviour for that block
inc/
  assets/enqueue.php      enqueues the compiled child assets after the parent's
  blocks/helpers.php      shared render helpers (icons, scope class, brand, URLs)
  blocks/query.php        shared WP_Query helpers
  bootstrap/version.php   DOCLAP_VERSION
  features/contact-form/  REST route, submission handler, delivery settings
resources/css/
  app.css                 entry: tokens → base → components → surfaces → overrides
  modules/00-tokens.css   design tokens (`--doclap-*`)
  modules/10-base.css     element baseline
  modules/20-components.css  shared building blocks (container, topnav, cards…)
  modules/30-surfaces.css page-level composition
  modules/40-overrides.css refinement layer, responsive collapse, chrome
resources/ts/
  main.ts                 front-end entry → assets/js/main.js
  runtime/motion.ts       GSAP motion layer (entrances, scrub, magnetic controls)
  runtime/blocks.ts       `bootBlocks()` — mounts block view scripts with cleanup
  editor/                 shared editor components (preview, media, repeater, rich text, colours)
patterns/                 33 block patterns (one per block, plus full-page compositions)
templates/                11 block templates (front page, page, single, archive, search, 404…)
parts/                    header.html, footer.html
tests/                    PHPUnit unit tests + the WordPress smoke suite
scripts/                  build and test entry points
```

## Commands

| Command | What it does |
|---|---|
| `npm run build` | `build:css` + `build:ts` + `build:blocks` |
| `npm run build:css` | PostCSS → `assets/css/app.css`, `assets/css/editor.css` |
| `npm run build:ts` | esbuild → `assets/js/main.js` |
| `npm run build:blocks` | esbuild → every `blocks/*/index.js` and `view.js` |
| `npm run watch` | CSS, TS and block watchers in one process |
| `npm run build:package` | zips the theme into `doclap-v{version}.zip` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ci` | typecheck → PHPStan → PHP-CS-Fixer check → build → PHPUnit |
| `npm run test:wp` | the smoke suite in a throwaway WordPress Playground |
| `npm run test:wp -- --wp-cli` | the same assertions against an existing site |
| `composer test` | PHPUnit unit tests only |
| `composer phpstan` / `composer php-cs-fixer` | PHP static analysis / auto-fix |

`npm run test:wp -- --wp-cli` accepts `WP_CLI_CMD` (a full command line, e.g. a wrapper that knows your local MySQL socket) or `WP_PATH`. It prints one `DOCLAP-OK <check>` line per passing contract and exits non-zero on any `DOCLAP-FAIL`.

## How it is put together

### PHP: blocks own their markup

Every block is dynamic: `render.php` renders, `block.json` declares. There is no `save()` output to migrate, so attribute changes never invalidate existing content. Editor code only ever *previews* the server render (`BlockPreview` calls the same block through the REST renderer), which is why the canvas and the front end agree.

`blocks/*/types.ts` mirrors `block.json`; keep the two in sync — `npm run typecheck` catches drift in editor code, and the smoke suite asserts the manifest contract.

### CSS: five modules, one scope

`resources/css/app.css` imports the modules in a deliberate order: tokens → base → components → surfaces → overrides. Everything is written under `.doclap-scope`, which every Doclap block root carries (via `doclap_scope_class()`), so no rule can leak into Nextora or the editor UI. The same compiled stylesheet is registered with `add_editor_style()`, so the canvas is styled by the same rules as the front end.

Section colours are attributes (`sectionBg`, `sectionHeading`, `sectionText`), emitted as `--doclap-block-*` custom properties on the block root — an unset colour emits nothing and the theme default applies.

### TypeScript: one runtime, per-block behaviour

`resources/ts/main.ts` boots the shared behaviour: the motion layer, the reading-progress bar and the scroll controls. Blocks that need interaction ship their own `view.ts` and mount it through `bootBlocks()`, which scopes every lookup to the block root (block ids are instance-prefixed, so no selector may depend on a document-wide id) and returns a cleanup function.

Accessibility is a hard contract, not a nicety:

- Markup is never hidden by CSS waiting for JavaScript — content is visible when the script fails to load.
- `prefers-reduced-motion: reduce` is a complete static mode, not a shorter animation.
- Focus, `aria-expanded`/`aria-controls` state and keyboard paths are owned by real controls; hover-only affordances always have a tap and keyboard equivalent.

### Design data

`theme.json` (v3) carries 14 palette colours, 6 spacing sizes, 7 font sizes and 5 font families (a `sans`/`mono` pair plus the three self-hosted families). 21 WOFF2 subsets of **Be Vietnam Pro**, **Bodoni Moda** and **IBM Plex Mono** live in `assets/fonts/`, so no font request leaves the site.

## Navigation and mega menus

The `doclap/site-header` block renders a **WordPress menu** — the one picked in the block (`menuId`), else whatever is assigned to the `primary` location. The walker adds one disclosure control per nested level and a decorative chevron; children are never rendered as raw nested `<li>`s.

Below **1024px** the header collapses into its own drawer; above it the row shows hover/focus submenus. At both widths the disclosure chevron is the same control, the same size and the same rotation, and opening one item closes the others — ordinary submenu and mega panel alike.

### Mega menus (Visual Mega Navigation)

Mega panels come from the **[beplus-visual-mega-nav](https://github.com/miketropi/beplus-visual-mega-nav)** plugin, authored per menu item. Doclap opts that plugin into inline panels inside its own drawer with one attribute on the nav element:

```php
<nav data-doclap-nav data-beplus-vmn-compact-mode="accordion">
```

With the attribute, the plugin never opens its off-canvas tablet drawer for this navigation — panels expand inline below their item, inside the drawer Doclap already owns, and the plugin leaves `document.body.style.overflow` alone. Markup without it keeps the plugin's defaults (flyout ≥1024px, off-canvas 768–1023px, accordion ≤767px).

Page scroll while the drawer is open is locked with the literal body class **`doclap-nav-locked`** (a class, not an inline style, so the plugin's own overflow writes cannot clear it).

The site-header block is also where the brand source lives: **text** or a **media-library logo**, resolved through `doclap_brand_image()` — attachment first, then the stored URL, then the text mark.

## Site footer

`doclap/site-footer` is attribute-driven and never depends on a registered menu: navigation groups, colophon, privacy link, back-to-top and the wordmark are all block attributes. The wordmark offers the same two brand sources as the header (text + superscript mark, or a media-library logo) and is capped so a wide logo cannot overflow the colophon.

## Contact form

`doclap/contact-form` posts to **`POST /wp-json/doclap/v1/contact`** with `name`, `email`, `company`, `services[]`, `message`, `consent`, a `_wpnonce` for the `doclap_contact_form` action, an optional `recaptcha_token`, and `website` as a honeypot.

The handler verifies the nonce, drops honeypot hits, requires consent/name/email/message, allowlists the service checkboxes, and rate-limits repeated submissions with a short transient keyed by a hash of IP and email. **No personal data is stored.**

Delivery is configured once per site, under **Appearance → Doclap Contact**, in the `doclap_contact_settings` option: recipient address (defaults to the site admin email), the admin and visitor subjects, and the reCAPTCHA v3 switch with its keys. The block inspector links straight to that screen, and only for a user who can act on it.

### Why delivery is not a block attribute

The first iteration did store it there — six attributes on the `doclap/contact-form` instance. They were removed on purpose, and the smoke suite now fails if a delivery-like attribute (`secret`, `recaptcha`, `subject`, `adminEmail`) comes back:

- **A secret in content is a leaked secret.** A block attribute is written into post content, so a reCAPTCHA secret key would reach revisions, the REST API, exports, staging pushes and the editor's own state. The option is read server-side and never rendered.
- **Different capability.** The block is edited with `edit_posts`; a recipient address and a credential must require `manage_options`.
- **One form, many placements.** The same block can be dropped on several surfaces, and per-instance attributes let two copies of one form send somewhere different.
- **Content has to stay portable.** Copying a page — or inserting the pattern on another site — must not carry credentials or a recipient.

So the block keeps what is content (copy, labels, service checkboxes) and the option keeps what is infrastructure.

Filters, when the option is not enough:

| Filter | Purpose |
|---|---|
| `doclap_contact_form_admin_email` | Recipient, overriding the option |
| `doclap_contact_form_admin_subject` | Admin email subject |
| `doclap_contact_form_user_subject` | Visitor confirmation subject |

## Testing

Two layers, both runnable without a browser:

1. **Unit tests** (`tests/*.php`, `composer test`) — pure PHP with a minimal WordPress stub bootstrap; they cover query helpers, reading time, block registration and contact validation.
2. **Smoke suite** (`tests/smoke/assertions.php`) — runs *inside* WordPress and asserts the surfaces the theme depends on: child-theme wiring, every block's registration and manifest contract, `theme.json` parsing and font files, the REST route, the patterns, the inner-page schemas, a real render of each section block, the site header against a temporary menu fixture (including the mega-panel and footer brand contracts), and the compiled assets.

The smoke suite creates and deletes its own menu fixture, so it is repeatable and leaves the site as it found it. Use `--wp-cli` against a real site when you need `WP_CONTENT_DIR`, the active plugins or the exact menu data of that site.

Nothing in the test suite loads a browser; front-end behaviour is verified by hand against the checklist in the commit history (pointer, keyboard, touch, hybrid pointer profiles, reduced motion, and with scripting disabled).

### Continuous integration

`.github/workflows/ci.yml` runs on every push to any branch and on every pull request, as three parallel jobs:

| Job | Gates |
|---|---|
| **PHP** (8.2) | `composer validate --strict`, PHPStan level 8, PHP-CS-Fixer dry run, PHPUnit |
| **TypeScript** (`.nvmrc`) | `tsc --noEmit`, `npm run build`, then fails if the committed `assets/css/app.css`, `assets/js/main.js` or any `blocks/*/index.js` / `view.js` differs from what the sources compile to — a source edit without a rebuild cannot land |
| **PHP 8.1** | `php -l` over every shipped PHP file, so a stray 8.2+ feature cannot ship |

The WordPress smoke suite is deliberately **not** in CI: it drives `npx @wp-playground/cli@latest`, a floating dependency whose current release requires Node ≥ 24.18 while `.nvmrc` pins only the major (it failed to boot on Node 24.16 here). It stays a local check — `npm run test:wp`, or `npm run test:wp -- --wp-cli` against a real site — and the release workflow re-runs the CI gates on every tag.

## Releasing

Tags are `vX.Y.Z` and must agree with the theme version, which is declared twice:

- `inc/bootstrap/version.php` — `DOCLAP_VERSION`, the single source of truth (the release zip is named from it);
- `style.css` — the `Version:` header.

To cut a release:

1. Bump both to the new version.
2. `npm run build` and commit the regenerated assets — the workflow refuses a tag whose committed CSS/JS differs from what the sources compile to.
3. `npm run test:wp` if you have a WordPress to point it at; the release job cannot run the smoke suite (it needs a real WordPress plus the Nextora parent).
4. `git tag vX.Y.Z && git push origin vX.Y.Z`.

`.github/workflows/release.yml` then, on that tag:

- refuses a tag that disagrees with `DOCLAP_VERSION` or with the `style.css` header, so a mislabelled zip cannot be published;
- runs `tsc --noEmit`, PHPStan and PHPUnit on **PHP 8.2** — the dev toolchain's floor, because PHPUnit 11 needs it;
- lints every shipped PHP file on **PHP 8.1**, the version the theme actually declares, so a stray 8.2+ feature cannot ship;
- rebuilds and fails if `assets/css/app.css`, `assets/js/main.js` or any `blocks/*/index.js` / `view.js` differs from the committed file;
- prunes the dev autoloader and runs `npm run build:package`, which produces `doclap-vX.Y.Z.zip` from the script the repo already uses;
- asserts the archive ships `style.css`, `assets/css/app.css`, `assets/js/main.js` and `functions.php` and carries none of `node_modules/`, `tests/`, `resources/`, `.git/`, `README.md` or `package.json`;
- attaches the zip and its `.sha256` to the release, creating it with generated notes if it does not exist yet.

To republish an existing tag without moving it, run the workflow from the Actions tab (`workflow_dispatch`) with the tag name; the asset is uploaded with `--clobber`.

## Conventions

- **PHP**: `declare(strict_types=1)`, tabs, `array()` syntax, WordPress coding standards, PHPStan level 8. Render code escapes on output (`esc_attr`/`esc_url`/`wp_kses_post`), never on input.
- **CSS**: keep the module order; prefer tokens over literal values; every selector starts with `.doclap-scope`; media queries use the shared breakpoints (`1024px` for navigation, `920px`/`640px` for composition) rather than ad-hoc numbers.
- **TypeScript**: no framework, DOM only. Scope all lookups to the block root, return a cleanup function from every mount, and never assume the script runs — the CSS must already work without it.
- **Editor**: attributes are the only persistence layer. Media is stored as `id` + `url` + `alt` through the shared `MediaControl`, so a deleted attachment degrades to its URL and a missing URL degrades to text.

## Credits and licences

Theme code: **GPL-2.0-or-later**, same as Nextora.

- **Be Vietnam Pro**, **Bodoni Moda**, **IBM Plex Mono** — SIL Open Font License 1.1 (self-hosted WOFF2 subsets).
- **Lucide** icons — ISC licence; used as inline SVG paths, no icon font or sprite request.
- `assets/models/david-head.bin` — the home hero's sculpture mesh. Sculpture: *Head of Michelangelo's David*, **Statens Museum for Kunst** cast scan (**CC0**); optimised mesh by **Thomas Flynn**, **CC BY 4.0** (<https://sketchfab.com/3d-models/head-of-michelangelos-david-optimised-d29af50360624e5e9b1855666475380d>). The same credits are reproduced verbatim in the hero and must stay visible.
- `assets/images/studio-workspace.*` — the studio photograph shipped with the reference prototype (credited there as an Unsplash illustration, bundled locally; re-attribute if a specific photographer credit is needed).

Release history: [`CHANGELOG.md`](CHANGELOG.md).
