"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser, type SidebarUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  CalendarIcon,
  ScissorsIcon,
  UsersIcon,
  UserCogIcon,
  Settings2Icon,
  CircleHelpIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PasskeyRegistrationModal } from "./auth/passkey-registration-modal";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: <CalendarIcon />,
    },
    {
      title: "Services",
      url: "/dashboard/services",
      icon: <ScissorsIcon />,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: <UsersIcon />,
    },
    {
      title: "Staff",
      url: "/dashboard/staff",
      icon: <UserCogIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Help",
      url: "docs.bloqk.nl",
      icon: <CircleHelpIcon />,
    },
  ],
};

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
};

export function AppSidebar({
  staff,
  navMain = data.navMain,
  navSecondary = data.navSecondary,
  homeUrl = "/dashboard",
  ...props
}: {
  staff: SidebarUser;
  // Overschrijfbaar zodat dezelfde sidebar ook het admin-paneel bedient
  navMain?: NavItem[];
  navSecondary?: NavItem[];
  homeUrl?: string;
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={homeUrl}>
                <Logo size="sm" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <PasskeyRegistrationModal />
        <NavUser staff={staff} />
      </SidebarFooter>
    </Sidebar>
  );
}
