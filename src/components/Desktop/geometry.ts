export type WindowBox = { x: number; y: number; width: number; height: number };

/** Keep the entire window between the menu bar and dock. */
export function constrainWindow(
  box: WindowBox,
  viewport: { width: number; height: number },
): WindowBox {
  const width = Math.min(
    Math.max(300, box.width),
    Math.max(1, viewport.width - 16),
  );
  const height = Math.min(
    Math.max(180, box.height),
    Math.max(1, viewport.height - 116),
  );
  return {
    width,
    height,
    x: Math.max(8, Math.min(box.x, viewport.width - width - 8)),
    y: Math.max(34, Math.min(box.y, viewport.height - height - 82)),
  };
}
