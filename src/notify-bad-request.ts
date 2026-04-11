import { isApiError } from "./api.js";
import { toastTextForBadRequest } from "./locale/zh-Hant.js";

/** If `e` is an HTTP 400 API error, shows a toast and returns true. */
export function tryToastBadRequest(
  e: unknown,
  showToast: (message: string) => void,
): boolean {
  if (isApiError(e) && e.status === 400) {
    showToast(toastTextForBadRequest(e.message));
    return true;
  }
  return false;
}
