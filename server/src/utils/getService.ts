import type { Core } from "@strapi/strapi";

import type { BlogSeoService } from "../services/blogseo";

// Strapi's service registry is loosely typed, so we bridge to the concrete
// service type here in one place rather than casting at every call site.
export const getBlogSeoService = (strapi: Core.Strapi): BlogSeoService =>
  strapi.plugin("blogseo").service("blogseo") as unknown as BlogSeoService;
