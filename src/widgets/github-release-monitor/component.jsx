import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: releaseData, error: releaseError } = useWidgetAPI(widget, "repositories");

  if (releaseError) {
    return <Container service={service} error={releaseError} />;
  }

  if (!releaseData) {
    return (
      <Container service={service}>
        <Block label="github-release-monitor.repositories" />
        <Block label="github-release-monitor.new" />
        <Block label="github-release-monitor.uptodate" />
        <Block label="github-release-monitor.status" />
      </Container>
    );
  }

  const { stats } = releaseData;

  return (
    <Container service={service}>
      <Block label="github-release-monitor.repositories" value={t("common.number", { value: stats.total })} />
      <Block label="github-release-monitor.new" value={t("common.number", { value: stats.new })} />
      <Block label="github-release-monitor.uptodate" value={t("common.number", { value: stats.uptodate })} />
      <Block 
        label="github-release-monitor.status" 
        value={stats.new > 0 ? t("github-release-monitor.updates") : t("github-release-monitor.status-uptodate")} 
      />
    </Container>
  );
}