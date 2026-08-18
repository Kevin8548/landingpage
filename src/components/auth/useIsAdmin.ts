import { isAdminAuthenticated } from "../../lib/adminAuth";

export function useIsAdmin(): boolean {
  return isAdminAuthenticated();
}