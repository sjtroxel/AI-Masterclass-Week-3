const WIKIPEDIA_API =
  "https://en.wikipedia.org/api/rest_v1/page/summary";

async function fetchSummary(title: string) {
  const response = await fetch(
    `${WIKIPEDIA_API}/${encodeURIComponent(title)}`
  );

  if (!response.ok) {
    throw new Error("Page not found");
  }

  return response.json();
}

export async function fetchStarWikipediaSummary(
  candidates: string[]
) {
  for (const title of candidates) {
    try {
      const data = await fetchSummary(title);

      // Basic astronomy sanity check
      if (
        data.extract &&
        /star|stellar|constellation|astronomical/i.test(data.extract)
      ) {
        return data;
      }
    } catch {
      // Try next candidate
    }
  }

  throw new Error("No suitable astronomy article found");
}
