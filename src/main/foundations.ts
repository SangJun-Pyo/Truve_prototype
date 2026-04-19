import type { DonationBundle, Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderBundleCard } from "../components/bundleCard";
import { renderFoundationCard } from "../components/explorerCard";
import {
  addFoundationToCart,
  addManyFoundationsToCart,
  getCartCount,
  isInCart,
} from "../services/cart";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundations");
}

const searchInputEl = document.getElementById("search-input") as HTMLInputElement | null;
const categorySelectEl = document.getElementById("category-select") as HTMLSelectElement | null;
const foundationsGridEl = document.getElementById("foundations-grid");
const bundlesGridEl = document.getElementById("bundles-grid");
const tabFoundationEl = document.getElementById("tab-foundation") as HTMLButtonElement | null;
const tabBundleEl = document.getElementById("tab-bundle") as HTMLButtonElement | null;
const cartCountEl = document.getElementById("cart-count");
const cartFabEl = document.getElementById("cart-fab") as HTMLElement | null;

let foundations: Foundation[] = [];
let bundles: DonationBundle[] = [];
let activeTab: "foundation" | "bundle" = "foundation";

function bumpCartBadge(): void {
  if (!cartCountEl) {
    return;
  }
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("bump");
}

function updateCartBadge(): void {
  if (!cartCountEl) {
    return;
  }
  const count = getCartCount();
  cartCountEl.textContent = String(count);
  cartCountEl.classList.toggle("active", count > 0);
}

function filterFoundations(): Foundation[] {
  const query = (searchInputEl?.value ?? "").trim().toLowerCase();
  const category = categorySelectEl?.value ?? "";

  return foundations.filter((foundation) => {
    const searchable = `${foundation.name} ${foundation.description} ${foundation.tags.join(" ")}`.toLowerCase();
    const queryMatch = query.length === 0 || searchable.includes(query);
    const categoryMatch = category.length === 0 || foundation.category === category;
    return queryMatch && categoryMatch;
  });
}

function animateToCart(sourceElement: HTMLElement): void {
  if (!cartFabEl) {
    return;
  }

  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = cartFabEl.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "flying-dot";

  const startX = sourceRect.left + sourceRect.width / 2 - 10;
  const startY = sourceRect.top + sourceRect.height / 2 - 10;
  dot.style.left = `${startX}px`;
  dot.style.top = `${startY}px`;

  document.body.appendChild(dot);
  dot.getBoundingClientRect();

  const endX = targetRect.left + targetRect.width / 2 - 10;
  const endY = targetRect.top + targetRect.height / 2 - 10;

  dot.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.2)`;
  dot.style.opacity = "0";

  dot.addEventListener("transitionend", () => {
    dot.remove();
  });
}

function renderFoundationTab(): void {
  if (!foundationsGridEl) {
    return;
  }

  const filtered = filterFoundations();
  if (filtered.length === 0) {
    foundationsGridEl.innerHTML = `<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;
    return;
  }

  foundationsGridEl.innerHTML = filtered
    .map((foundation) => renderFoundationCard(foundation, isInCart(foundation.id)))
    .join("");

  foundationsGridEl.querySelectorAll<HTMLButtonElement>(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.addId;
      if (!id) {
        return;
      }

      addFoundationToCart(id);
      animateToCart(button);
      updateCartBadge();
      bumpCartBadge();
      renderFoundationTab();
    });
  });
}

function renderBundleTab(): void {
  if (!bundlesGridEl) {
    return;
  }

  bundlesGridEl.innerHTML = bundles.map((bundle) => renderBundleCard(bundle, foundations)).join("");

  bundlesGridEl.querySelectorAll<HTMLButtonElement>(".add-bundle-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const bundleId = button.dataset.bundleId;
      if (!bundleId) {
        return;
      }
      const bundle = bundles.find((item) => item.id === bundleId);
      if (!bundle) {
        return;
      }

      addManyFoundationsToCart(bundle.allocations.map((allocation) => allocation.foundationId));
      animateToCart(button);
      updateCartBadge();
      bumpCartBadge();
      renderFoundationTab();

      button.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      button.disabled = true;
      button.classList.add("is-added");
    });
  });
}

function syncTabs(): void {
  if (!tabFoundationEl || !tabBundleEl || !foundationsGridEl || !bundlesGridEl) {
    return;
  }

  const isFoundation = activeTab === "foundation";
  tabFoundationEl.classList.toggle("active", isFoundation);
  tabBundleEl.classList.toggle("active", !isFoundation);
  foundationsGridEl.classList.toggle("hidden", !isFoundation);
  bundlesGridEl.classList.toggle("hidden", isFoundation);
}

function bindEvents(): void {
  searchInputEl?.addEventListener("input", () => {
    if (activeTab === "foundation") {
      renderFoundationTab();
    }
  });

  categorySelectEl?.addEventListener("change", () => {
    if (activeTab === "foundation") {
      renderFoundationTab();
    }
  });

  tabFoundationEl?.addEventListener("click", () => {
    activeTab = "foundation";
    syncTabs();
    renderFoundationTab();
  });

  tabBundleEl?.addEventListener("click", () => {
    activeTab = "bundle";
    syncTabs();
    renderBundleTab();
  });
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();
  bundles = await repositories.foundationRepository.listBundles();

  bindEvents();
  syncTabs();
  renderFoundationTab();
  renderBundleTab();
  updateCartBadge();
}

void init();
