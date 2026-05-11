import { redirectMobileVisitors } from "../shared/mobileRedirect";
import { renderTopNav } from "../shared/nav";

redirectMobileVisitors();

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("about");
}
