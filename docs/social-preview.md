# LCH social sharing / Open Graph preview

LCH serves static Open Graph and X Card tags directly in `index.html`. Social crawlers do not render the React hero. The canonical card image is `public/assets/social/lch-preview.png` (1200 × 630, PNG).

## Source of truth

- Design source: `scripts/social-preview.html`, based on LCH's production hero colors, business positioning, and official `public/assets/brand/lch-technologies-logo@2x.png`.
- Published image: `public/assets/social/lch-preview.png`.
- Absolute public image URL: `https://lch-app.cloud/assets/social/lch-preview.png`.
- Both `og:image` and `twitter:image` must use the same public HTTPS PNG. `twitter:card` is `summary_large_image`.
- GitHub Actions validates the landing page, social image and all existing unit/build tests when any of these files change.

## Regenerate the card

From the repository root, in an environment with Chromium available:

```sh
chromium --headless --no-sandbox --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot="$(pwd)/public/assets/social/lch-preview.png" \
  "file://$(pwd)/scripts/social-preview.html"
npm run check
```

The source HTML is *not* served as the social asset; only the rendered image is. Keep all copy grounded in LCH's actual service capabilities, and retain the approved official brand asset.

## Production release checks

LCH is an existing supervised Node app behind Cloudflare Tunnel/Caddy, not an automatic GitHub Pages deployment. A merge alone does not publish the image. Follow `docs/donna-lch-integration.md` for guarded production build and immutable-release/rollback procedures.

After deploying the merged commit, verify:

```sh
curl -fsS -A 'Twitterbot/1.0' https://lch-app.cloud/ | grep -E 'og:image|twitter:(card|image)'
curl -fsSI https://lch-app.cloud/assets/social/lch-preview.png
curl -fsS https://lch-app.cloud/health
```

Expected image response: HTTP 200 with `content-type: image/png`, an actual PNG with 1200 × 630 pixels and a matching canonical URL. Check X and LinkedIn unfurling with a new share after deployment; previously shared URLs can remain cached by the platform.
