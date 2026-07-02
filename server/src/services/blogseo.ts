import type { Core } from "@strapi/strapi";

const PLUGIN_ID = "blogseo-io";
const STRAPI_TOKEN_NAME = "BlogSEO";
const DEFAULT_BLOGSEO_API_URL = "https://app.blogseo.io";

interface BlogSeoStore {
  connected: boolean;
  apiKey?: string;
  siteUrl?: string;
  pluralApiId?: string;
  strapiTokenId?: number;
}

interface ApiTokenService {
  create(attributes: {
    name: string;
    description?: string;
    type: "full-access" | "read-only" | "custom";
    lifespan: number | null;
  }): Promise<{ id: number; accessKey: string }>;
  revoke(id: number): Promise<unknown>;
  getByName(name: string): Promise<{ id: number } | null>;
}

interface RegisterResponse {
  success?: boolean;
  error?: string;
  resolvedSiteUrl?: string;
}

const service = ({ strapi }: { strapi: Core.Strapi }) => {
  const store = () => strapi.store({ type: "plugin", name: PLUGIN_ID });
  const getState = async (): Promise<BlogSeoStore> =>
    ((await store().get({ key: "connection" })) as BlogSeoStore | null) ?? { connected: false };
  const setState = (value: BlogSeoStore) => store().set({ key: "connection", value });
  const apiTokens = () => strapi.service("admin::api-token") as unknown as ApiTokenService;
  const blogSeoApiUrl = () =>
    strapi.config.get<string>(`plugin::${PLUGIN_ID}.blogSeoApiUrl`, DEFAULT_BLOGSEO_API_URL);
  return {
    async getStatus() {
      const state = await getState();
      return {
        connected: !!state.connected,
        siteUrl: state.siteUrl ?? null,
        pluralApiId: state.pluralApiId ?? null,
      };
    },
    listCollectionContentTypes() {
      return Object.entries(strapi.contentTypes)
        .filter(([uid, schema]) => uid.startsWith("api::") && schema.kind === "collectionType")
        .map(([uid, schema]) => ({
          uid,
          displayName: schema.info?.displayName ?? schema.info?.singularName ?? uid,
          pluralApiId: schema.info?.pluralName ?? "",
        }));
    },
    async connect({
      apiKey,
      pluralApiId,
      serverUrl,
    }: {
      apiKey: string;
      pluralApiId: string;
      serverUrl: string;
    }) {
      const previous = await getState();
      if (previous.strapiTokenId) await apiTokens().revoke(previous.strapiTokenId).catch(() => null);
      const leftover = await apiTokens().getByName(STRAPI_TOKEN_NAME);
      if (leftover) await apiTokens().revoke(leftover.id).catch(() => null);
      const created = await apiTokens().create({
        name: STRAPI_TOKEN_NAME,
        description: "Token used by BlogSEO to publish articles into this Strapi instance.",
        type: "full-access",
        lifespan: null,
      });
      const postRegister = () =>
        fetch(`${blogSeoApiUrl()}/api/integrations/strapi-plugin/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            strapiUrl: serverUrl,
            strapiApiToken: created.accessKey,
            pluralApiId,
            strapiVersion: strapi.config.get<string>("info.strapi"),
          }),
        });
      let response: Awaited<ReturnType<typeof fetch>>;
      try {
        // Retry once: a keep-alive socket closed by the server between requests
        // makes the first fetch throw even though BlogSEO is reachable.
        response = await postRegister().catch(postRegister);
      } catch {
        await apiTokens().revoke(created.id).catch(() => null);
        throw new Error("Could not reach BlogSEO. Check this server's outbound network access.");
      }
      const json = (await response.json().catch(() => ({}))) as RegisterResponse;
      if (!response.ok) {
        await apiTokens().revoke(created.id).catch(() => null);
        throw new Error(json.error ?? "BlogSEO rejected the connection. Double-check your connection key.");
      }
      const nextState: BlogSeoStore = {
        connected: true,
        apiKey,
        siteUrl: json.resolvedSiteUrl ?? serverUrl,
        pluralApiId,
        strapiTokenId: created.id,
      };
      await setState(nextState);
      return { connected: true, siteUrl: nextState.siteUrl };
    },
    async disconnect() {
      const state = await getState();
      if (state.strapiTokenId) await apiTokens().revoke(state.strapiTokenId).catch(() => null);
      await setState({ connected: false });
      return { connected: false };
    },
  };
};

export type BlogSeoService = ReturnType<typeof service>;

export default service;
