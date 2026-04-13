import { AppState, initialAppState } from "../types/domain";

type Listener<TState> = (state: TState, previousState: TState) => void;
type Updater<TState> = Partial<TState> | ((prev: TState) => Partial<TState>);

export interface Store<TState> {
  getState: () => TState;
  setState: (updater: Updater<TState>) => void;
  subscribe: (listener: Listener<TState>) => () => void;
}

export function createStore<TState extends object>(initialState: TState): Store<TState> {
  let state = initialState;
  const listeners = new Set<Listener<TState>>();

  const getState = () => state;

  const setState = (updater: Updater<TState>) => {
    const previousState = state;
    const partial = typeof updater === "function" ? updater(previousState) : updater;
    state = { ...previousState, ...partial };
    listeners.forEach((listener) => listener(state, previousState));
  };

  const subscribe = (listener: Listener<TState>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

export const appStore = createStore<AppState>(initialAppState);

export function updateAllocation(foundationId: string, weight: number): void {
  appStore.setState((prev) => ({
    allocation: {
      ...prev.allocation,
      [foundationId]: weight,
    },
  }));
}

export function resetAllocation(): void {
  appStore.setState({ allocation: {} });
}

export function addToCart(item: AppState["cart"][number]): void {
  appStore.setState((prev) => {
    const exists = prev.cart.some((cartItem) => cartItem.foundationId === item.foundationId);
    if (exists) return {};
    return { cart: [...prev.cart, item] };
  });
}

export function removeFromCart(foundationId: string): void {
  appStore.setState((prev) => ({
    cart: prev.cart.filter((item) => item.foundationId !== foundationId),
  }));
}

export function updateFilters(nextFilters: Partial<AppState["filters"]>): void {
  appStore.setState((prev) => ({
    filters: {
      ...prev.filters,
      ...nextFilters,
    },
  }));
}

export function updateUserStatus(nextStatus: Partial<AppState["userStatus"]>): void {
  appStore.setState((prev) => ({
    userStatus: {
      ...prev.userStatus,
      ...nextStatus,
    },
  }));
}
