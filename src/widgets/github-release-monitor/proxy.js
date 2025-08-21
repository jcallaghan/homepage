import fs from "fs";
import path from "path";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "githubReleaseMonitorProxyHandler";
const logger = createLogger(proxyName);

export default async function githubReleaseMonitorProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const { configPath } = widget;

  if (!configPath) {
    logger.debug("Missing configPath for github-release-monitor widget");
    return res.status(400).json({ error: "Missing configPath configuration" });
  }

  const filePath = path.join(configPath, endpoint);

  try {
    if (!fs.existsSync(filePath)) {
      logger.debug("repositories.json file not found at: %s", filePath);
      return res.status(404).json({ error: "repositories.json file not found" });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const repositories = JSON.parse(fileContent);

    if (!Array.isArray(repositories)) {
      logger.debug("Invalid repositories.json format - expected array");
      return res.status(400).json({ error: "Invalid repositories.json format" });
    }

    // Process the data to provide useful statistics
    const totalRepositories = repositories.length;
    const newReleases = repositories.filter((repo) => repo.isNew).length;
    const upToDate = repositories.filter((repo) => !repo.isNew).length;

    const processedData = {
      repositories,
      stats: {
        total: totalRepositories,
        new: newReleases,
        uptodate: upToDate,
      },
    };

    return res.status(200).json(processedData);
  } catch (error) {
    logger.error("Error reading repositories.json: %s", error.message);
    return res.status(500).json({ error: "Error reading repositories.json file" });
  }
}