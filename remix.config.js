/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [/~/],
  serverModuleFormat: "esm",
  future: {
    v2_routeConvention: true,
  },
};
