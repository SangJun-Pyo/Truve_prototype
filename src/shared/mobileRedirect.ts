const MOBILE_PAGE = "mobile.html";
const FORCE_DESKTOP_KEY = "truve_force_desktop";

function isMobileExperienceViewport(): boolean {
  return (
    window.matchMedia("(max-width: 900px)").matches ||
    window.matchMedia("(pointer: coarse) and (max-width: 1024px)").matches
  );
}

export function redirectMobileVisitors(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith(`/${MOBILE_PAGE}`) || path.endsWith(MOBILE_PAGE)) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get("desktop") === "1") {
    window.sessionStorage.setItem(FORCE_DESKTOP_KEY, "1");
    return;
  }

  if (window.sessionStorage.getItem(FORCE_DESKTOP_KEY) === "1") return;
  if (!isMobileExperienceViewport()) return;

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(`./${MOBILE_PAGE}?from=${encodeURIComponent(current)}`);
}

export function enableDesktopMode(): void {
  window.sessionStorage.setItem(FORCE_DESKTOP_KEY, "1");
}
