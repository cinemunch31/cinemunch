FinSight — Static Finance Blog

This is a simple static finance blog scaffold (HTML/CSS/JS).

Run locally:

1. Open `index.html` in your browser (double-click or use a dev server).

Optional (serve with Python HTTP server):

```bash
# from this project root
python3 -m http.server 8000
# then open http://localhost:8000
```

What is included:
- `index.html` — main site
- `styles.css` — professional styles and dark mode
- `script.js` — dynamic rendering, search, category filter, pagination, subscribe modal
- `posts.json` — sample posts

Post management and build
-------------------------

Content lives in `posts/` as Markdown files with YAML front‑matter.  A small build script converts them into `posts.json` which is loaded by the frontend.

```bash
npm install          # once, to get the converter
npm run build        # generate/refresh posts.json from markdown
```

Add new articles by creating `posts/slug.md` with fields such as `title`, `date`, `category`, and `excerpt`.


Deployment
----------

### GitHub Pages

A GitHub Actions workflow (`.github/workflows/gh-pages.yml`) automatically publishes the site to the `gh-pages` branch whenever `main` is pushed.  If you prefer manual deploy:

```bash
git checkout --orphan gh-pages
cp -r * .
git commit -am "publish"
git push origin gh-pages --force
```

You can then enable GitHub Pages in the repository settings with `gh-pages` as the source.


### Netlify ✅

To deploy on Netlify, connect this repository in the Netlify dashboard. Use the following settings:

- **Build command:** `npm run build`
- **Publish directory:** `.` (root of the repo)

A `netlify.toml` file is already included for automatic configuration.  During builds Netlify will run the same `npm run build` script to regenerate `posts.json` from markdown.

You can also drag & drop the current directory into [app.netlify.com/drop](https://app.netlify.com/drop) after running `npm run build` locally.


Additional ideas
----------------
- Add analytics and SEO metadata
- Enhance styling or animation
- Integrate comments or a more advanced CMS
