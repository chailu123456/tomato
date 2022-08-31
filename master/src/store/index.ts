// store.ts
import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import state, { State } from "./state";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state,
  mutations,
  getters,
  actions
});

// define your own `useStore` composition function
export function useStore(): Store<State> {
  return baseUseStore(key);
}
