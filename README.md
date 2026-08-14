# US Electrical demo clone

Static clone of https://us-electrical-demo.pages.dev/direction-1-powered-by-us/
served from the site root, for design iteration on a separate Cloudflare Pages
project.

## Layout

- `site/index.html` - the page (all JS is inline, no bundler needed)
- `site/_astro/*.css` - the two stylesheets from the original build
- `site/favicon.ico`

## Local preview

    python3 -m http.server 8099 --directory site

## Deploy

    npx wrangler pages deploy site --project-name=<project>
