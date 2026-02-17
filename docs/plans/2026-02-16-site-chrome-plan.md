# Site Chrome Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add navbar and footer to simdjson-viz matching johnkeiser.com's visual style.

**Architecture:** Standalone CSS replicating the main site's Bootstrap 3 navbar and footer look. Svelte handles mobile hamburger toggle. No Bootstrap/jQuery dependencies added.

**Tech Stack:** Svelte 5, CSS custom properties, Google Fonts (Mina), Font Awesome 5 (CDN)

---

### Task 1: Add CDN dependencies to index.html

**Files:**
- Modify: `index.html`

**Step 1: Add Google Fonts and Font Awesome links**

In `index.html`, add these lines inside `<head>`, before the closing `</head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Mina">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.0/css/all.css" integrity="sha384-Mmxa0mLqhmOeaE8vgOSbKacftZcsNYDjQzuCOm6D02luYSzBG8vpaOykv9lFQ51Y" crossorigin="anonymous">
```

Also update the `<title>` to something more descriptive:

```html
<title>simdjson-viz - John Keiser</title>
```

**Step 2: Verify dev server still starts**

Run: `npm run dev` and confirm no errors in terminal and page loads.

**Step 3: Commit**

```bash
git add index.html
git commit -m "Add Google Fonts and Font Awesome CDN links"
```

---

### Task 2: Update global styles in app.css

**Files:**
- Modify: `src/app.css`

**Step 1: Replace src/app.css with updated global styles**

Replace the entire contents of `src/app.css` with:

```css
:root {
  --accent: #386890;
  font-family: 'Mina', sans-serif;
  line-height: 1.5;
  color: #222;
  background-color: #f5f5f5;
}

html, body {
  height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
  padding-top: 55px;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* ---- Navbar ---- */

.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 55px;
  background-color: var(--accent);
  z-index: 1000;
  display: flex;
  align-items: center;
  font-size: 120%;
}

.site-nav .nav-container {
  max-width: 1170px;
  width: 100%;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-nav a {
  color: #cccccc;
  text-decoration: none;
}

.site-nav a:hover {
  color: #fff;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}

.nav-links a {
  padding: 8px 15px;
  display: block;
}

.nav-right {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}

.nav-right a {
  padding: 8px 10px;
  display: block;
  font-size: 120%;
}

/* Mobile hamburger */
.nav-brand {
  display: none;
  color: #cccccc;
  font-size: 1rem;
}

.nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-direction: column;
  gap: 5px;
}

.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #ccc;
}

.nav-collapse {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
}

@media (max-width: 767px) {
  .nav-brand {
    display: block;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-collapse {
    display: none;
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    background-color: var(--accent);
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-collapse.open {
    display: flex;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
  }

  .nav-links a {
    padding: 10px 20px;
  }

  .nav-right {
    padding: 10px 15px;
  }
}

/* ---- Footer ---- */

.site-footer {
  background-color: var(--accent);
  border-top: 1px solid #e7e7e7;
  color: #cccccc;
  text-align: center;
  padding: 15px;
  font-size: 0.85rem;
}

.site-footer a {
  color: #cccccc;
  text-decoration: none;
}

.site-footer a:hover {
  color: #fff;
  text-decoration: underline;
}

.site-footer p {
  margin: 0.25rem 0;
}
```

**Step 2: Verify the page still renders**

Run dev server. Background should now be light grey, font should be Mina. Content will look off without the navbar/footer markup yet -- that's expected.

**Step 3: Commit**

```bash
git add src/app.css
git commit -m "Update global styles to match johnkeiser.com"
```

---

### Task 3: Add navbar and footer to App.svelte

**Files:**
- Modify: `src/App.svelte`

**Step 1: Add navbar, footer, and mobile toggle**

In the `<script>` block, add after the existing imports:

```ts
let navOpen = $state(false);
```

Replace the outer template structure so the markup is:

```svelte
<nav class="site-nav">
  <div class="nav-container">
    <span class="nav-brand">John Keiser</span>
    <button class="nav-toggle" onclick={() => navOpen = !navOpen} aria-label="Toggle navigation">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <div class="nav-collapse" class:open={navOpen}>
      <ul class="nav-links">
        <li><a href="https://johnkeiser.com/">Home</a></li>
        <li><a href="https://johnkeiser.com/post/">Posts</a></li>
        <li><a href="https://johnkeiser.com/tags/">Tags</a></li>
      </ul>
      <ul class="nav-right">
        <li><a href="mailto:john@johnkeiser.com"><i class="far fa-envelope"></i></a></li>
        <li><a href="https://github.com/jkeiser"><i class="fab fa-github"></i></a></li>
        <li><a href="https://twitter.com/jkeiser2/"><i class="fab fa-twitter"></i></a></li>
        <li><a href="https://www.linkedin.com/in/john-keiser-81618532/"><i class="fab fa-linkedin"></i></a></li>
      </ul>
    </div>
  </div>
</nav>

<main>
  <!-- existing content unchanged -->
</main>

<footer class="site-footer">
  <p>Powered by <a href="https://gohugo.io">Hugo</a>. Themed by <a href="https://github.com/nathancday/min_night">min_night</a>.</p>
  <p><a rel="license" href="https://creativecommons.org/licenses/by/4.0/"><i class="fab fa-creative-commons"></i> Attribution 4.0 International license</a></p>
</footer>
```

Keep all existing `<main>` content and `<style>` block exactly as-is.

**Step 2: Update scoped styles in App.svelte**

In the existing `<style>` block, update `main` to add `flex: 1`:

```css
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
}
```

All other scoped styles (`.figure`, `.example-grid`, `h1`, media query) stay unchanged.

**Step 3: Visual verification**

Run dev server and verify:
- Steel-blue navbar fixed to top with Home/Posts/Tags links and social icons
- Steel-blue footer at bottom with credits
- Light grey background
- Mina font throughout prose
- Content still readable and MaskGrid widgets work
- On mobile width (< 768px): hamburger appears, clicking toggles nav links
- Nav links go to johnkeiser.com (they'll navigate away -- that's correct)

**Step 4: Commit**

```bash
git add src/App.svelte
git commit -m "Add navbar and footer matching johnkeiser.com"
```

---

### Task 4: Update design doc

**Files:**
- Modify: `docs/ui-design.md`

**Step 1: Add a section about site chrome**

Append to end of `docs/ui-design.md`:

```markdown

## Site Chrome

Navbar and footer replicate the look of johnkeiser.com (Bootstrap 3 min_night
theme) using standalone CSS. No Bootstrap or jQuery dependency.

- **Navbar**: fixed top, steel-blue (`--accent: #386890`), nav links point to
  `https://johnkeiser.com/...`. Mobile hamburger uses Svelte `$state` toggle.
- **Footer**: matching steel-blue, credits Hugo/min_night, CC license link.
- **Layout**: body is flex column with sticky footer. `#app` also flex column.
- **Font**: Google Fonts Mina, loaded via CDN in `index.html`.
- **Icons**: Font Awesome 5, loaded via CDN in `index.html`.
```

**Step 2: Commit**

```bash
git add docs/ui-design.md
git commit -m "Document site chrome in UI design notes"
```

---

### Task 5: Build and verify

**Step 1: Run build**

Run: `npm run build`
Expected: Clean build with no errors.

**Step 2: Commit if any build-related fixes needed**

If the build revealed issues, fix and commit.
