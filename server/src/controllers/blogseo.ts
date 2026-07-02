import type { Core } from "@strapi/strapi";

import { getBlogSeoService } from "../utils/getService";

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async status(ctx) {
    ctx.body = await getBlogSeoService(strapi).getStatus();
  },
  contentTypes(ctx) {
    ctx.body = { contentTypes: getBlogSeoService(strapi).listCollectionContentTypes() };
  },
  async connect(ctx) {
    const { apiKey, pluralApiId } = (ctx.request.body ?? {}) as {
      apiKey?: string;
      pluralApiId?: string;
    };
    if (!apiKey || typeof apiKey !== "string")
      return ctx.badRequest("A BlogSEO connection key is required.");
    if (!pluralApiId || typeof pluralApiId !== "string")
      return ctx.badRequest("Select a content type to publish into.");
    const configured = strapi.config.get<string>("server.url");
    const serverUrl =
      configured && /^https?:\/\//.test(configured) ? configured : ctx.request.origin;
    try {
      ctx.body = await getBlogSeoService(strapi).connect({
        apiKey: apiKey.trim(),
        pluralApiId,
        serverUrl,
      });
    } catch (error) {
      return ctx.badRequest(error instanceof Error ? error.message : "Failed to connect to BlogSEO");
    }
  },
  async disconnect(ctx) {
    ctx.body = await getBlogSeoService(strapi).disconnect();
  },
});

export default controller;
