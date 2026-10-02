# AlfaGlass Site Auditor 0.2.0

Read-only administrator audit for this site's production/dev comparison. No remote service, passwords or new API credentials are required. Administrator sessions need manage_options; downloads need a WordPress nonce. REST GET /wp-json/alfaglass-auditor/v1/report uses normal WordPress authentication and private/no-store headers. Do not create an application password for convenience.

## Report

Schema v2 exports only editorial types page, post, product, materials and uslugi, including drafts but excluding private posts. Requests, forms, employees, reviews, attachments and users are excluded. Other types have aggregate counts only. Reports retain titles and selected SEO fields; they are private working data, never public Git artifacts.

Content, excerpts and Elementor data have SHA-256 fingerprints instead of raw text. The current site's origin is normalized, while third-party URLs are preserved. SEO configuration and Redirection rules have hashes, no raw settings or redirect targets. No request/IP/access logs are queried. Menu URLs omit credentials, query strings and fragments. Hashes indicate changes, not correctness or successful page rendering.

Existing rewrite rules are read from options; they are never regenerated. Code hashes cover installed theme PHP/CSS/JS/HTML at depth 2, files up to 2 MiB. This is explicitly a partial code inventory, not full file/media verification. Content exports indicate truncation above 5000 items. Taxonomy lists remain bounded to 1000 terms each.

## Run

After approved installation/activation: Tools → AlfaGlass Site Auditor → Download JSON audit. Save outside the web root and public Git. WP-CLI: `wp alfaglass audit --path=/private/audit.json` (creates a 0600 file). CLI execution trusts the existing shell access; it is not an alternative authentication endpoint. Loading the file inside WP-CLI eval also permits testing without permanent plugin activation.

Compare complete v2 exports with `scripts/compare-site-audits.py BEFORE AFTER --output PRIVATE_RESULT.json`. It matches pages by type/path and other editorial types by type/slug, never database ID. Empty slugs are counted as unmatched, not guessed. Draft/publish differences and environment-specific settings require manual interpretation. No report import, DB/file edits, automatic fixes or outbound connections are implemented. Existing WordPress plugins/cache hooks may execute during normal WordPress loading.

## Changes from 0.1.0

Fixed an array return type returning an object, which caused a fatal export error. Limited detailed records to editorial types. Removed raw SEO option values and server upload paths. Removed rewrite regeneration. Added canonical/robots/social SEO fields, content and Elementor fingerprints, group/navigation markers, rule hashes, theme code hashes, explicit completeness and no-store REST responses. Optional mbstring dependency removed.
