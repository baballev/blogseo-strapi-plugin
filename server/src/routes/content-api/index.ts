export default () => ({
  type: "content-api",
  routes: [
    { method: "GET", path: "/schema", handler: "blogseo.schema", config: { policies: [] } },
  ],
});
