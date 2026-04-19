import type { Foundation } from "../api";

export interface CartItem {
  foundationId: string;
  ratioPct: number;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
}

const CART_STORAGE_KEY = "truve_cart_v1";

function normalizeRatios(items: CartItem[]): CartItem[] {
  if (items.length === 0) {
    return [];
  }

  const base = Math.floor(100 / items.length);
  let remain = 100 - base * items.length;

  return items.map((item) => {
    const extra = remain > 0 ? 1 : 0;
    remain -= extra;
    return { ...item, ratioPct: base + extra };
  });
}

export function getCartState(): CartState {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return { items: [] };
  }
  try {
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }
    return { items: parsed.items };
  } catch {
    return { items: [] };
  }
}

export function saveCartState(state: CartState): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function getCartCount(): number {
  return getCartState().items.length;
}

export function isInCart(foundationId: string): boolean {
  return getCartState().items.some((item) => item.foundationId === foundationId);
}

export function addFoundationToCart(foundationId: string): CartState {
  const state = getCartState();
  if (state.items.some((item) => item.foundationId === foundationId)) {
    return state;
  }

  const next = {
    items: normalizeRatios([
      ...state.items,
      {
        foundationId,
        ratioPct: 0,
        addedAt: new Date().toISOString(),
      },
    ]),
  };

  saveCartState(next);
  return next;
}

export function addManyFoundationsToCart(foundationIds: string[]): CartState {
  let state = getCartState();
  const existing = new Set(state.items.map((item) => item.foundationId));
  const additions = foundationIds
    .filter((id) => !existing.has(id))
    .map((id) => ({ foundationId: id, ratioPct: 0, addedAt: new Date().toISOString() }));

  if (additions.length === 0) {
    return state;
  }

  state = {
    items: normalizeRatios([...state.items, ...additions]),
  };
  saveCartState(state);
  return state;
}

export function removeFoundationFromCart(foundationId: string): CartState {
  const state = getCartState();
  const next = {
    items: normalizeRatios(state.items.filter((item) => item.foundationId !== foundationId)),
  };
  saveCartState(next);
  return next;
}

export function clearCart(): CartState {
  const next = { items: [] };
  saveCartState(next);
  return next;
}

export function updateCartRatio(foundationId: string, ratioPct: number): CartState {
  const state = getCartState();
  const next = {
    items: state.items.map((item) =>
      item.foundationId === foundationId ? { ...item, ratioPct: Math.max(0, Math.min(100, ratioPct)) } : item,
    ),
  };
  saveCartState(next);
  return next;
}

export function getCartItemsWithFoundations(
  foundations: Foundation[],
): Array<{ foundation: Foundation; ratioPct: number; addedAt: string }> {
  const state = getCartState();
  return state.items
    .map((item) => {
      const foundation = foundations.find((foundationItem) => foundationItem.id === item.foundationId);
      if (!foundation) {
        return null;
      }
      return {
        foundation,
        ratioPct: item.ratioPct,
        addedAt: item.addedAt,
      };
    })
    .filter((item): item is { foundation: Foundation; ratioPct: number; addedAt: string } => item !== null);
}
