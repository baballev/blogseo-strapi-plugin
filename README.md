# BlogSEO for Strapi

Connect your Strapi project to [BlogSEO](https://www.blogseo.io) — the AI-powered SEO platform that writes, illustrates and publishes SEO-optimized blog articles to your site on autopilot, and builds high-quality backlinks to grow your organic traffic.

This plugin links your Strapi instance to your BlogSEO account in a couple of clicks: no manual API-token creation, no copy-pasting content-type IDs between dashboards.

## What is BlogSEO?

[BlogSEO](https://www.blogseo.io) helps businesses grow their organic search traffic end to end:

- **AI-written SEO articles** — long-form, SEO-optimized articles researched and written for your niche, in 100+ languages, with AI-generated cover and inline images.
- **High-quality backlinks** — grow your Domain Rating with backlink building, and track your backlink profile over time.
- **Publishing on autopilot** — articles are scheduled and published straight into your CMS (Strapi, WordPress, Shopify, Ghost, and many more), formatted for your content model.
- **SEO analytics** — keyword tracking and Google Search Console insights to measure what your content brings in.

The plugin is free and open source. Publishing requires a [BlogSEO](https://www.blogseo.io) account.

## What the plugin does

- Adds a **BlogSEO** page under **Settings** in your Strapi admin panel.
- Lets you connect with a single **connection key** pasted from your BlogSEO dashboard.
- Automatically creates a **scoped Strapi API token** (find/create/update on your chosen collection + media upload) — you never have to create or handle one manually.
- Detects your **content types and locales** and registers everything with BlogSEO in one click.
- Shows the **connection status** and lets you disconnect (revoking the token) at any time.

## Requirements

- Strapi **v5**
- A [BlogSEO account](https://www.blogseo.io)

## Installation

```bash
npm install strapi-plugin-blogseo
# or
yarn add strapi-plugin-blogseo
```

Then rebuild your admin panel:

```bash
npm run build
```

The plugin is enabled automatically once installed. No configuration file changes are required.

## Getting started

1. In your [BlogSEO dashboard](https://app.blogseo.io), go to **Integrations → Strapi** and choose **Connect via plugin** to generate a connection key.
2. In your Strapi admin panel, go to **Settings → BlogSEO**, paste the key, pick the collection your articles should be published into, and click **Connect**.
3. That's it — BlogSEO now publishes your scheduled articles straight into that collection.

Full walkthrough: [BlogSEO Strapi integration docs](https://www.blogseo.io/docs/integrations/strapi).

## Advanced configuration

All options are optional and go in `config/plugins.ts`:

```ts
export default {
    "blogseo-io": {
        enabled: true,
        config: {
            // Override the BlogSEO API endpoint (self-hosted / staging setups)
            blogSeoApiUrl: "https://app.blogseo.io",
        },
    },
};
```

## Support

- Website: [https://www.blogseo.io](https://www.blogseo.io)
- Documentation: [https://www.blogseo.io/docs/integrations/strapi](https://www.blogseo.io/docs/integrations/strapi)
- Email: [support@blogseo.io](mailto:support@blogseo.io)

Found a bug or have a feature request? [Open an issue](https://github.com/baballev/blogseo-strapi-plugin/issues).

## License

[MIT](LICENSE)
