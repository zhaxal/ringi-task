// instrumentation.ts
export const runtime = "nodejs";

export async function register() {
  try {
    await import("./utils/initDB");

    console.log(" ✓ Database initialized");
  } catch (error) {
    console.error(" ⨯ Failed to initialize database:", error);
  }
}
