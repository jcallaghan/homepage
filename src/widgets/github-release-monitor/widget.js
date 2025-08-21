import githubReleaseMonitorProxyHandler from "./proxy";

const widget = {
  api: "{configPath}/{endpoint}",
  proxyHandler: githubReleaseMonitorProxyHandler,

  mappings: {
    repositories: {
      endpoint: "repositories.json",
    },
  },
};

export default widget;