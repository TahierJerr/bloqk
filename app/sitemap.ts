import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    const routes: {
        path: string;
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
        priority: number;
    }[] = [
        { path: "", changeFrequency: "weekly", priority: 1 },
        { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
        { path: "/stack", changeFrequency: "monthly", priority: 0.7 },
        { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    ];

    return routes.map((route) => ({
        url: `${siteConfig.url}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
