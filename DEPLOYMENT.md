# Deployment and performance

This document owns hosting, data distribution, performance, and audience measurement decisions. Start with the [README](README.md) for setup, [AGENTS.md](AGENTS.md) for project principles, and the [pipeline guide](scripts/nominas/README.md) for preparing source data.

## Agreed approach

- Host the static Astro build on Cloudflare Pages, using the maintainer's existing Cloudflare domain. No runtime backend is required.
- Store prepared data used by the website in the repository. This keeps contributions and builds straightforward without adding a bucket or release-download workflow. Original downloads and preparation reports remain local; candidates are not published automatically.
- Generate a separate static search dataset for each university and year. A visitor should load only the selected university/year, with only the fields needed by the interface. Keep full preparation artifacts out of browser downloads.
- Use Cloudflare's HTTP response compression, with supported algorithms negotiated by the browser. Do not add application-level decompression libraries or require contributors to maintain compressed source copies.
- Use browser and CDN caching to avoid unnecessary repeat downloads. Data updates must become visible without serving outdated data indefinitely; the exact cache policy remains to be implemented and verified.
- Use Cloudflare Web Analytics for visits, page views, and real-user performance measurements. Its browser script adds an external request; do not add other analytics tools without a human decision. Audience metrics are estimates, not exact counts of unique people.

Compression reduces transfer size, not the original files stored in Git or the amount of decoded JSON the browser must process. Keep the repository representation readable and reviewable. Additional performance machinery should follow measured needs rather than hypothetical scale.

## Implementation status

These are approved decisions, not a record of a completed deployment. The current website still uses its UAA prototype dataset. Multi-university data integration, promotion of prepared data into the repository, domain configuration, analytics activation, and cache/compression verification remain pending. No account configuration or deployment was performed when documenting these decisions.

The current `.gitignore` still excludes pipeline candidates and reports. The data promotion step must make the approved website data available in Git and align contribution instructions with its chosen location; raw downloads must remain excluded.

## Verify before launch

1. Follow the [project validation requirements](AGENTS.md), build the site, and inspect `dist/`. Confirm that only intended website assets are included, with no raw downloads or preparation reports.
2. Check the selected university/year in the browser's Network panel. Confirm that other universities are not downloaded and that each response uses the expected JSON content type.
3. On the deployed site, inspect `Content-Encoding` and transferred versus decoded sizes to confirm compression. Local compression experiments do not prove deployed behavior.
4. Verify repeat-visit caching and the visibility of a newly deployed data version. Test on a mobile device or representative throttled connection, including search responsiveness after loading.
5. Enable Web Analytics once, verify that it records page views on the public domain, and check performance measurements. Script blockers can prevent reporting; analytics must not be required for search to work.

## Provider references

Consult current provider documentation before changing deployment settings or making capacity claims:

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Content compression](https://developers.cloudflare.com/speed/optimization/content/compression/)
- [Web Analytics for Pages](https://developers.cloudflare.com/pages/how-to/web-analytics/)
- [GitHub file and repository size guidance](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
