import { Router } from "vue-router";
import { store } from "../store";
import { getSession } from "@/utils";
export function hasPermission(route: Router): void {
  let isAuthenticated;
  route.beforeEach((to, from, next) => {
    try {
      isAuthenticated = getSession("user", true);
    } catch {
      isAuthenticated = null;
    }
    if (!isAuthenticated && to.name !== "login") {
      store.commit("USER", null);
      next({ path: "/login" });
    } else {
      next();
    }
  });
  if (getSession("user", true)) {
    store.dispatch("EMPLOYEE_LIST");
  }
}
