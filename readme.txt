=== Doclap ===

Contributors: miketropi
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 1.0.0
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

độc lập — an editorial portfolio child theme for Nextora. Every bespoke surface
(home, about, contact, FAQ, notes archive, search, note detail, 404) is composed
from editable Doclap dynamic blocks.

== Description ==

Doclap is a block child theme of **Nextora** (`Template: nextora`). It ships no
page-builder markup: each surface is a server-rendered dynamic block with its own
editor controls, and the templates place those blocks between the shared header
and footer.

Surfaces and their blocks:

* Front page — nine independently insertable section blocks, in landing order:

  | Block | Section |
  | --- | --- |
  | `doclap/home-hero` | Hero sculpture, two views, credit line |
  | `doclap/home-disciplines` | Discrete design, motion and technology band |
  | `doclap/home-work` | Two self-initiated canvas studies and their dialogs |
  | `doclap/home-about` | Craft introduction and service list |
  | `doclap/home-process` | Numbered process steps |
  | `doclap/home-team` | Collaboration heading, studio image, role cards |
  | `doclap/home-testimonials` | Perspective carousel and editorial note |
  | `doclap/home-journal` | Journal heading and note links |
  | `doclap/home-contact` | Closing contact band |

* About — `doclap/about-profile`.
* Contact — `doclap/contact-form` (real email delivery, no local-only drafts).
* FAQ — `doclap/faq-list` (category filters, native disclosures, live count).
* Notes archive and blog index — `doclap/notes-archive` (query-driven).
* Note detail — `doclap/single-note` (metadata, table of contents, related notes).
* Search — `doclap/search-results` (native WordPress search query).
* 404 — `doclap/not-found`.
* Shared chrome — `doclap/site-header` and `doclap/site-footer` template parts.

Every section block is dynamic, lives in the `Doclap Blocks` inserter category and
can be inserted, reordered, duplicated or removed on its own. The
`Doclap — Home Landing` pattern inserts all nine in the canonical order when a
whole landing page is wanted, and each block also ships its own one-block pattern
(`doclap/home-hero` … `doclap/home-contact`).

== Requirements ==

* WordPress 6.4 or later, PHP 8.1 or later.
* The **Nextora** parent theme, active as the parent. Doclap depends on Nextora's
  block, asset and contact-form infrastructure; the parent's `nextora-app` style
  and `nextora-main` script handles (the latter exposes GSAP and ScrollTrigger as
  `window.gsap` / `window.ScrollTrigger`) are enqueued dependencies of the child
  assets.

== Required content setup ==

Doclap does **not** create, modify or delete any content on activation. To match
the reference site, an editor sets up:

1. **Settings → Reading**: a static front page (any page — the front page template
   renders the nine `doclap/home-*` section blocks in landing order).
2. Pages with these slugs, each assigned the matching template in the page
   sidebar (the templates are registered under Appearance → Editor → Templates):

   | Page slug | Template |
   | --- | --- |
   | `about-us` | About Us |
   | `contact` | Contact Us |
   | `faq` | Frequently Asked Questions |

   The three template names are registered by the Nextora parent; Doclap supplies
   the matching `templates/*.html` files, which override the parent's files for
   those names. Doclap deliberately ships no `customTemplates` entry of its own:
   `customTemplates` is merged positionally between parent and child `theme.json`,
   so redeclaring it in the child would silently drop entries the parent registers
   (`page-full-width` among them).

3. Optional: a posts page if the notes archive should live at a path such as
   `/notes/`. The header and footer link to the notes archive through the `@notes`
   token, which resolves to the page set as “Posts page” (or the site home when
   none is set).

Any URL field in the header, footer or a block accepts an absolute URL, a path
such as `/about-us/`, a `#section` fragment, or the tokens `@notes` (blog archive)
and `@search` (search endpoint).

=== Front page template and Site Editor overrides ===

`templates/front-page.html` is the canonical composition: one block per landing
section, in order, inside the shared `main` group. A front page saved in the Site
Editor is stored as a `wp_template` override in the database, and that override
always wins over the theme file, so edits made there are not touched by a theme
update.

The landing blocks keep the structural anchors the navigation depends on —
`#work`, `#about`, `#process`, `#team`, `#testimonials`, `#journal` and
`#contact`, plus the `#experiment-flow` and `#experiment-orbit` card ids. Each
section sets that id from its own block anchor: any value entered in
Appearance → Editor → Templates for that block replaces the default, and the
matching header, footer and call-to-action links have to be updated with it.

* **Upgrading from the single-block landing page.** The 1.0.0 release replaced
  the monolithic `doclap/portfolio-home` block with the nine section blocks, and
  ships no alias for it. An existing Site Editor override of the Front Page
  template still contains that block and renders an “unsupported block”
  notice; customisations stored only on it are not migrated automatically.
  Recover by resetting the customised Front Page template, or by replacing the
  `doclap/portfolio-home` instance with the `Doclap — Home Landing` pattern.

== Menus ==

The header and footer are attribute-driven and never depend on a registered
nav menu, so they work on a fresh site with no menus configured. Navigation is
edited directly in the `Doclap site header` and `Doclap site footer` blocks —
including the disclosure panels, quick links, the header call to action, and the
studio/discover link groups.

== Contact form ==

`POST /doclap/v1/contact` validates a `wp_rest` nonce (`doclap_contact_form`
action), rejects the honeypot, validates required consent/name/email/message,
allowlists the service checkboxes, and rate-limits repeated submissions with a
short transient keyed by a hash of IP and email. No personal data is stored.

Filters:

* `doclap_contact_form_admin_email` — recipient (defaults to the site admin email,
  or the block's configured address).
* `doclap_contact_form_admin_subject` — admin email subject.
* `doclap_contact_form_user_subject` — visitor confirmation subject.

reCAPTCHA v3 is optional and off by default; the secret key is never rendered into
page markup.

== Build ==

Generated files are committed because WordPress consumes them directly:
`assets/css/app.css`, `assets/js/main.js`, and each block's `index.js`,
`index.asset.php`, `view.js` and `view.asset.php`. Author changes in `resources/`
and in each block's TypeScript/PHP sources, then regenerate:

```
npm install
composer install
npm run build          # CSS, then front-end TS, then all blocks
npm run typecheck      # tsc --noEmit
npm run lint:php:all   # PHPStan (level 8) + PHP CS Fixer dry run
composer test          # PHPUnit
npm run ci             # everything above, in order
npm run test:wp        # isolated WordPress smoke run (Playground)
npm run test:wp -- --wp-cli   # the same assertions through WP-CLI
npm run build:package  # doclap-v1.0.0.zip
```

`npm run watch` runs the CSS, TS and block watchers together.

=== Tests ===

* `composer test` — PHPUnit unit suite (`tests/*Test.php`) covering block
  registration, the shared query helpers, contact sanitising and error shaping,
  and reading-time boundaries. WordPress functions are doubled in
  `tests/Support/wp-stubs.php`, so the suite needs no database.
* `npm run test:wp` — smoke assertions (`tests/smoke/assertions.php`) executed in a
  throwaway WordPress, with the local Nextora and Doclap themes mounted. It checks
  the child-theme relationship, registration of every `doclap/*` block, `theme.json`
  parsing and its merge with the parent, the declared font faces and compiled
  assets, the contact REST route and the insertion patterns. Pass `-- --wp-cli` to
  run the identical assertions against an existing install through WP-CLI
  (`WP_CLI_CMD` may supply a wrapper command, `WP_PATH` the install path).

== Licenses and attribution ==

Theme code: GPL-2.0-or-later, like the parent theme.

Fonts (`assets/fonts/`, self-hosted WOFF2 subsets, latin / latin-ext / vietnamese):

* **Be Vietnam Pro** — SIL Open Font License 1.1.
* **Bodoni Moda** — SIL Open Font License 1.1.
* **IBM Plex Mono** — SIL Open Font License 1.1.

Assets:

* `assets/models/david-head.bin` — the optimized David head mesh used by the home
  hero. Sculpture: Head of Michelangelo's David, **Statens Museum for Kunst (SMK)
  cast sculpture scan, CC0**. Optimized mesh: **Thomas Flynn, CC BY 4.0** —
  https://sketchfab.com/3d-models/head-of-michelangelos-david-optimised-d29af50360624e5e9b1855666475380d
  The credited static poster (`assets/images/david-head-poster.*`) is rendered from
  the same mesh. Both credits are reproduced verbatim in the hero and must stay
  visible.
* `assets/images/studio-workspace.{jpg,webp,avif}` — the collaboration/studio
  photograph shipped with the supplied reference prototype, credited there as an
  Unsplash illustration. Bundled locally (no hotlinking); the original Unsplash
  photo id is not identifiable from the prototype's inlined copy, so re-attribution
  is required if a specific photographer credit is needed.
* Icons are inline SVG paths derived from **Lucide** (ISC license) and require no
  icon font or sprite request.

== Changelog ==

= 1.0.0 =
* First release: eighteen Doclap blocks — the home landing page split into nine
  section blocks (`doclap/home-hero` … `doclap/home-contact`) plus the eight
  remaining surfaces — self-hosted editorial fonts, Doclap colour and font
  presets, colour-scheme switcher preset, and the design-specific contact
  transport.
* The Front Page template composes the nine home section blocks directly, and the
  `Doclap — Home Landing` pattern inserts the same composition into any page. The
  monolithic `doclap/portfolio-home` landing block is gone; see *Front page
  template and Site Editor overrides* for the upgrade path.
