export type MuralWindow = "contact" | "mural";

export function initialMuralWindows(muralRequested: boolean): MuralWindow[] {
  return muralRequested ? ["contact", "mural"] : ["contact"];
}
