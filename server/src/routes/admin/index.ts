export default () => ({
  type: "admin",
  routes: [
    { method: "GET", path: "/status", handler: "blogseo.status", config: { policies: [] } },
    {
      method: "GET",
      path: "/content-types",
      handler: "blogseo.contentTypes",
      config: { policies: [] },
    },
    { method: "POST", path: "/connect", handler: "blogseo.connect", config: { policies: [] } },
    { method: "POST", path: "/disconnect", handler: "blogseo.disconnect", config: { policies: [] } },
  ],
});
