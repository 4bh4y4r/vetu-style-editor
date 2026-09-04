import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Polyfill HTMLCanvasElement 2D Context dynamically for Vitest
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (contextType === '2d') {
      const self = this;
      return {
        fillStyle: 'rgb(180, 105, 45)',
        fillRect: () => {},
        drawImage: () => {},
        getImageData: () => {
          const width = self.width || (globalThis as any).__TEST_W__ || 200;
          const height = self.height || (globalThis as any).__TEST_H__ || 240;
          const data = new Uint8ClampedArray(width * height * 4);

          // Retrieve active test RGB color
          const activeR = (globalThis as any).__TEST_R__ ?? 180;
          const activeG = (globalThis as any).__TEST_G__ ?? 105;
          const activeB = (globalThis as any).__TEST_B__ ?? 45;

          const isShortSleeve = (globalThis as any).__TEST_SHORT_SLEEVE__;
          const isPatterned = (globalThis as any).__TEST_PATTERN__;

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const i = (y * width + x) * 4;
              let alpha = 255;

              // If short sleeve test, make lower outer sides transparent (simulating short sleeves ending near waist)
              if (isShortSleeve && y > height * 0.50) {
                if (x < width * 0.28 || x > width * 0.72) {
                  alpha = 0;
                }
              }

              // If pattern test, alternate accent color on grid
              let r = activeR;
              let g = activeG;
              let b = activeB;

              if (isPatterned && (x % 30 < 5 || y % 30 < 5)) {
                r = Math.min(255, activeR + 140);
                g = Math.min(255, activeG + 140);
                b = Math.min(255, activeB + 140);
              }

              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
              data[i + 3] = alpha;
            }
          }
          return { data, width, height };
        },
        putImageData: () => {},
      } as any;
    }
    return null;
  };

  HTMLCanvasElement.prototype.toBlob = function (callback: (blob: Blob | null) => void) {
    callback(new Blob(['mock_image'], { type: 'image/jpeg' }));
  };
}

if (typeof Image !== 'undefined') {
  Object.defineProperty(Image.prototype, 'src', {
    set(val) {
      this._src = val;
      this.width = (globalThis as any).__TEST_W__ || 200;
      this.height = (globalThis as any).__TEST_H__ || 240;
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 2);
    },
    get() {
      return this._src;
    },
  });
}

if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = () => {};
}
