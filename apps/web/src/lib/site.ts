export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";

export const siteName = "Fynans";

export const siteTagline = "Receipt-level expense tracking for households";

export const siteDescription =
  "Scan a store receipt into an itemised expense, then send it to your family for approval before it counts.";
