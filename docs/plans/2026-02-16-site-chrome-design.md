# Site Chrome: Match johnkeiser.com

Add navbar and footer to simdjson-viz so it looks like part of johnkeiser.com.

## Approach

Replicate the main site's navbar and footer with standalone CSS (no Bootstrap dependency). Light mode only.

## Changes

### index.html
- Add Google Fonts (Mina) and Font Awesome 5 CDN links.

### src/app.css
- Font: `'Mina', sans-serif`. Background: `#f5f5f5`. Add `--accent: #386890`.
- Navbar styles: fixed top, `--accent` background, 55px height, `#ccc` links, white on hover.
- Footer styles: `--accent` background, `#ccc` text/links.
- Body: `padding-top: 55px`, flex column for sticky footer.

### src/App.svelte
- Add `<nav>` with: brand text (mobile), hamburger toggle (mobile, Svelte-only), left nav links (Home `/`, Posts `/post/`, Tags `/tags/`), right social icons (email, GitHub, Twitter, LinkedIn).
- Add `<footer>` with Hugo/min_night credit and CC license.
- Nav links are absolute URLs to `https://johnkeiser.com/...`.
- Mobile hamburger uses a Svelte `$state` toggle, no jQuery.
- `<main>` keeps 800px max-width (wider than main site's 750px to fit visualizations).

## Not included
- Night mode toggle
- Bootstrap/jQuery dependencies
- Changes to MaskGrid styling
