# TibaSmart redesign plan

## Outcome
Create a responsive, static TibaSmart Solutions landing page that modernizes the current healthcare-management site while preserving its product positioning, modules, integrations, security story, and contact/demo pathways.

## Product structure
- `src/App.tsx`: page content, navigation, sections, CTA links, and responsive semantic markup.
- `src/components/OrbitField.tsx`: Three.js scene with a rotating perspective ring, CSS2D cards for the exact client logos currently shown on TibaSmart’s partner section, hover/focus pause, and reduced-motion handling.
- `public/assets/clients/`: locally stored Translite Pharma, Teleflex, Al-Siddique Medical Centre, Silvercrest, Jalad, Radiance, St. Jude’s, Velma Memorial, and Uzair Pharmacy logo assets.
- `src/styles.css`: design tokens, responsive layout, component styling, focus states, and motion rules.
- `public/assets/tibasmart-logo.png`: reused TibaSmart brand mark from the current website.
- `public/manus-routes.json`: current route manifest for the single-page site.
- `public/robots.txt` and `public/sitemap.xml`: crawler-facing compatibility files.

## Architecture and serving
The content is public and can be built ahead of visits, so use a static Vite build. The Preview server listens on the configured port 3000. The eventual published site should serve `dist/` as static output with long-lived caching for versioned assets and normal revalidation for HTML. There are no server routes, API calls, authentication flows, or database requirements in this stage.

## Design and interaction
Use the approved Orbit of Care direction: deep navy, medical blue, mint/cyan, white surfaces, crisp sans typography, orbital geometry, and subtle motion. The 3D trust orbit is a progressive enhancement: Three.js renders the scene, the labels remain keyboard-focusable HTML elements, hovering or focusing the orbit pauses it, and `prefers-reduced-motion` keeps the field still. On narrow screens the orbit scales down without changing content.

## SEO
Provide meaningful initial HTML for the public home route, route-specific title and description, Open Graph/Twitter tags, a canonical URL only when `VITE_SITE_URL` is configured, and sitemap/robots files that point to the configured public origin when available. Do not invent an internal preview origin.

## Verification
Use TypeScript diagnostics, the Vite production build, and direct HTTP checks for `/`, `/manus-routes.json`, `/robots.txt`, and `/sitemap.xml`. Confirm the Three.js module is included in the application source and the reduced-motion / hover-focus behavior is represented in code and CSS. Visual screenshot review is not required unless a rendered defect is observed.
