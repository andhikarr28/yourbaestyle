export function useIsAdmin() {
  // For this internal app, we'll consider all users as admins
  // to allow access to the knowledge management page.
  return true;
}
