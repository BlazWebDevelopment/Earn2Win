import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/token`, lastModified: now, priority: 0.9 },
    { url: `${SITE.url}/create`, lastModified: now, priority: 0.9 },
    { url: `${SITE.url}/how-it-works`, lastModified: now, priority: 0.7 },
  ];
}
