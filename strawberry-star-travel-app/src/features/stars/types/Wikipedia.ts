export interface WikipediaSummary {
  title: string;
  pageid: number;
  extract: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
}