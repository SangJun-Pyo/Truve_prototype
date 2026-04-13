export type AppRouteKey = "donation" | "foundations" | "governance" | "about" | "status";

export interface AppRoute {
  key: AppRouteKey;
  path: string;
  title: string;
  navLabel: string;
}

export const routes: Record<AppRouteKey, AppRoute> = {
  donation: {
    key: "donation",
    path: "/donation",
    title: "Donation Builder",
    navLabel: "Donation",
  },
  foundations: {
    key: "foundations",
    path: "/foundations",
    title: "Foundation Explorer",
    navLabel: "Foundations",
  },
  about: {
    key: "about",
    path: "/about",
    title: "About Truve",
    navLabel: "About",
  },
  governance: {
    key: "governance",
    path: "/governance",
    title: "Governance Voting",
    navLabel: "Governance",
  },
  status: {
    key: "status",
    path: "/status",
    title: "My Donation Status",
    navLabel: "Status",
  },
};

export const routeList: AppRoute[] = Object.values(routes);

export function isAppRouteKey(value: string): value is AppRouteKey {
  return value in routes;
}

export function getRouteByPath(pathname: string): AppRoute | undefined {
  return routeList.find((route) => route.path === pathname);
}
