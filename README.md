# The Upper Bench — standalone Cloudflare Worker website

A close visual recreation of the single-page landing layout at theupperbench.com. No Hugo, CMS, build framework, or third-party runtime is used.

## Add your own media

Copy your existing original photo to `public/media/sauna.jpg` and video loop to `public/media/background.mp4`. Both filenames are case-sensitive. Use H.264-encoded MP4 for browser compatibility, ideally well under the **25 MiB per-file limit** for Worker static assets. The project includes a small Worker handler that adds HTTP byte-range responses for the video, which helps playback in Safari.

The placeholder favicon in `public/favicon.svg` can be replaced with your original logo.

## GitHub → Cloudflare setup

1. Create a **new** GitHub repository called `upper-bench-worker` (do not reuse or overwrite your live website's repository).
2. Add the **contents** of this folder to the repository, preserving `public/` and `src/`.
3. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Worker**, connect the GitHub repository.
4. Name the Worker **`upper-bench-preview`**, to match `wrangler.jsonc`.
5. **Build command:** leave blank. **Deploy command:** `npx wrangler deploy`. **Root directory:** `/`.
6. Deploy and open the generated `*.workers.dev` address.

Later, when ready, map your real domain to this Worker in Cloudflare without disrupting the existing site before the switch.

## Important

The `<meta name="robots" content="noindex,nofollow">` tag in `public/index.html` intentionally prevents this **temporary duplicate** from competing with your live site in search results. Remove it when you move the real domain and the new site becomes canonical.

Editing files in GitHub on `main` triggers deployment automatically after Git integration is connected.

All buttons link to the current publicly listed The Upper Bench accounts. Edit them in `public/index.html` as needed.

## Files

- `wrangler.jsonc`: Cloudflare Worker configuration
- `src/index.js`: small video range responder (for Safari playback)
- `public/index.html`: homepage structure and links
- `public/styles.css`: design and responsive layout
- `public/favicon.svg`: placeholder logo
- `public/media/`: your still image and loop video go here
