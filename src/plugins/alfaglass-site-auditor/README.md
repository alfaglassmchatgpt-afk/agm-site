# AlfaGlass Site Auditor

Read-only WordPress audit plugin for planning the alfaglass.ru development environment and SEO/content restructuring work.

## Install

1. Copy `alfaglass-site-auditor` to `wp-content/plugins/`.
2. Activate **AlfaGlass Site Auditor** in WordPress admin.
3. Open **Tools -> AlfaGlass Site Auditor**.
4. Click **Download JSON audit**.

The export is available only to users with `manage_options`.

## WP-CLI

```bash
wp alfaglass audit --path=/tmp/alfaglass-site-audit.json
```

## REST

Authenticated administrators can request:

```text
/wp-json/alfaglass-auditor/v1/report
```

## Privacy and license posture

The plugin does not export full post content, user lists, passwords, tokens, API keys, SMTP secrets, salts, or private keys. It includes option names and byte sizes so we can identify commercial plugins and licensing areas without exposing secret values.

Useful for:

- Theme and plugin inventory.
- Commercial/license risk review.
- SEO URL and metadata inventory.
- Content type, taxonomy, menu, and media inventory.
- Database table, row count, size, and autoloaded option review.

Not included by design:

- Raw database dump.
- Media files.
- Full Elementor JSON content.
- Full user/customer/order data.
- Plugin license key values.
