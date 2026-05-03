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
    title: "기부하기",
    navLabel: "기부하기",
  },
  foundations: {
    key: "foundations",
    path: "/foundations",
    title: "기부하기",
    navLabel: "기부하기",
  },
  about: {
    key: "about",
    path: "/about",
    title: "서비스 소개",
    navLabel: "서비스 소개",
  },
  governance: {
    key: "governance",
    path: "/governance",
    title: "거버넌스",
    navLabel: "거버넌스",
  },
  status: {
    key: "status",
    path: "/status",
    title: "내 기부 현황",
    navLabel: "내 기부 현황",
  },
};

export const routeList: AppRoute[] = Object.values(routes);

export function isAppRouteKey(value: string): value is AppRouteKey {
  return value in routes;
}

export function getRouteByPath(pathname: string): AppRoute | undefined {
  return routeList.find((route) => route.path === pathname);
}
