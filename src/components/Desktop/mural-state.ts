export type MuralWindow = "mural";

export function initialMuralWindows(muralRequested: boolean): MuralWindow[] {
  return muralRequested ? ["mural"] : [];
}

export function nextWindowOrder(orders: Record<string, number>) {
  return Math.max(0, ...Object.values(orders)) + 1;
}
