import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements neither ResizeObserver nor layout, so every element
 * measures 0x0 and <SketchFrame> would never render under test.
 *
 * This stub reports one fixed box (200x48 — a default `md` button) so tests
 * can assert that the frame is sized from the measurement rather than from a
 * hardcoded constant. Real browsers never see it.
 */
const TEST_BOX = { width: 200, height: 48 };

class ResizeObserverStub implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { ...TEST_BOX } as DOMRectReadOnly,
          borderBoxSize: [{ inlineSize: TEST_BOX.width, blockSize: TEST_BOX.height }],
          contentBoxSize: [{ inlineSize: TEST_BOX.width, blockSize: TEST_BOX.height }],
          devicePixelContentBoxSize: [
            { inlineSize: TEST_BOX.width, blockSize: TEST_BOX.height },
          ],
        } as unknown as ResizeObserverEntry,
      ],
      this,
    );
  }

  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    ...TEST_BOX,
    top: 0,
    left: 0,
    right: TEST_BOX.width,
    bottom: TEST_BOX.height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
};
