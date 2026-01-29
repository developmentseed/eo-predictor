import type { DataRepoType } from "@/store/filterStore";

export const buildDataRepoLink = (
  dataRepoType?: DataRepoType,
  dataRepoUrl?: string
) => {
  if (!dataRepoUrl) {
    return null;
  }

  const isStac = dataRepoType?.toLowerCase() === "stac";
  const url = isStac
    ? `https://developmentseed.org/stac-map/?href=${encodeURIComponent(
        dataRepoUrl
      )}`
    : dataRepoUrl;

  return { url, isStac };
};
