import { enableDesktopMode } from "../shared/mobileRedirect";

const desktopLinkEl = document.getElementById("desktop-link") as HTMLAnchorElement | null;
desktopLinkEl?.addEventListener("click", () => {
  enableDesktopMode();
});
