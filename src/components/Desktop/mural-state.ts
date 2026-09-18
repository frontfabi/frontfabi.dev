export type MuralWindow = "contact" | "mural";

export function initialMuralWindows(muralRequested: boolean): MuralWindow[] {
  return muralRequested ? ["contact", "mural"] : ["contact"];
}

export function nextWindowOrder(orders: Record<string, number>) {
  return Math.max(0, ...Object.values(orders)) + 1;
}
