import { authReady, currentUser } from "~/lib/pocketbase";

export function requireAuth(navigate: (path: string) => void, redirect = "/") {
  const user = currentUser();

  if (!user) {
    navigate(`/auth/login?redirect=${redirect}`);
    return false;
  }

  return true;
}