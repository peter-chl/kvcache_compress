# kvcache_compress

Static reference site on KV cache compression, deployed to GitHub Pages at
https://peter-chl.github.io/kvcache_compress/

- Next.js static export (`output: "export"`, `basePath: "/kvcache_compress"`)
- `npm run build` writes `out/` (gitignored); `.github/workflows/deploy.yml` builds and deploys on push to `main`
- To preview locally, serve `out/` under `/kvcache_compress/`, not at the web root, or client JS won't load
