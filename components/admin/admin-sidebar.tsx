"use client";

import { EuroIcon, GlobeIcon, InboxIcon } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarUser } from "@/components/nav-user";

const adminNavMain = [
    {
        title: "Aanvragen",
        url: "/admin",
        icon: <InboxIcon />,
    },
    {
        title: "Prijzen",
        url: "/admin/pricing",
        icon: <EuroIcon />,
    },
];

const adminNavSecondary = [
    {
        title: "Naar de site",
        url: "/",
        icon: <GlobeIcon />,
    },
];

export function AdminSidebar({ user }: { user: SidebarUser }) {
    return (
        <AppSidebar
            staff={user}
            navMain={adminNavMain}
            navSecondary={adminNavSecondary}
            homeUrl="/admin"
            variant="inset"
        />
    );
}
