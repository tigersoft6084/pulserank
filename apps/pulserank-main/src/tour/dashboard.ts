import { Tour } from "nextstepjs";

export function createDashboardTourSteps(t: (key: string) => string): Tour[] {
  return [
    {
      tour: "dashboard",
      steps: [
        {
          icon: "👋",
          title: t("welcome.title"),
          selector: '[data-tour-id="platform-overview"]',
          content: t("welcome.content"),
          side: "bottom",
          showControls: true,
          showSkip: true,
        },
        {
          icon: "🔍",
          title: t("serpmachine.title"),
          selector: '[data-tour-id="platform-overview"]',
          content: t("serpmachine.content"),
          side: "bottom",
          showControls: true,
          showSkip: true,
        },
        {
          icon: "🔤",
          title: t("keywordHistory.title"),
          selector: '[data-tour-id="keyword-input"]',
          content: t("keywordHistory.content"),
          side: "bottom",
          showControls: true,
          showSkip: true,
        },
        {
          icon: "✨",
          title: t("research.title"),
          selector: '[data-tour-id="header-research"]',
          content: t("research.content"),
          side: "bottom",
          showControls: true,
          showSkip: true,
        },
        {
          icon: "🌐",
          title: t("analyzeWebsite.title"),
          selector: '[data-tour-id="website-input"]',
          content: t("analyzeWebsite.content"),
          side: "top",
          showControls: true,
          showSkip: true,
        },
      ],
    },
  ];
}
