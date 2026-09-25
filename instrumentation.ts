export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { validateAllConfig } = await import("./lib/config");
  validateAllConfig();
}
