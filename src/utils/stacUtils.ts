export const buildDataRepoLink = (
  dataRepoType?: string,
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
