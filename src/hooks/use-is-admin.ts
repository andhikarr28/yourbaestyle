export function useIsAdmin() {
  // With anonymous login, there is no concept of an admin role from the client.
  return false;
}
