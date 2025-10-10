/**
 * Adaptive Performance Manager
 * Monitors frame time and dynamically adjusts quality settings
 */

export interface PerformanceConfig {
  dpr: number;
  bloomEnabled: boolean;
  chromaticAberrationEnabled: boolean;
  particleCount: number;
  shadowsEnabled: boolean;
}

export class PerformanceManager {
  private frameTimes: number[] = [];
  private readonly maxSamples = 120; // 2 seconds at 60fps
  private readonly targetFrameTime = 16.67; // 60fps
  private config: PerformanceConfig;
  private onConfigChange: (config: PerformanceConfig) => void;

  constructor(onConfigChange: (config: PerformanceConfig) => void) {
    this.onConfigChange = onConfigChange;
    this.config = {
      dpr: Math.min(window.devicePixelRatio, 2),
      bloomEnabled: true,
      chromaticAberrationEnabled: true,
      particleCount: 1000,
      shadowsEnabled: true
    };
  }

  recordFrame(deltaTime: number): void {
    const frameTime = deltaTime * 1000; // convert to ms
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Check every 120 frames (2 seconds)
    if (this.frameTimes.length >= this.maxSamples) {
      this.evaluate();
    }
  }

  private evaluate(): void {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    
    // If we're consistently over 16ms (below 60fps)
    if (avgFrameTime > this.targetFrameTime) {
      this.degrade();
    } 
    // If we're stable and fast, we can restore quality
    else if (avgFrameTime < this.targetFrameTime * 0.9) {
      this.restore();
    }
  }

  private degrade(): void {
    let changed = false;

    // Step 1: Disable chromatic aberration first (least noticeable)
    if (this.config.chromaticAberrationEnabled) {
      this.config.chromaticAberrationEnabled = false;
      changed = true;
    }
    // Step 2: Reduce particle count
    else if (this.config.particleCount > 500) {
      this.config.particleCount = 500;
      changed = true;
    }
    // Step 3: Reduce DPR
    else if (this.config.dpr > 1) {
      this.config.dpr = Math.max(1, this.config.dpr - 0.5);
      changed = true;
    }
    // Step 4: Disable bloom
    else if (this.config.bloomEnabled) {
      this.config.bloomEnabled = false;
      changed = true;
    }
    // Step 5: Further reduce particles
    else if (this.config.particleCount > 200) {
      this.config.particleCount = 200;
      changed = true;
    }

    if (changed) {
      this.frameTimes = []; // Reset sampling
      this.onConfigChange(this.config);
    }
  }

  private restore(): void {
    let changed = false;
    const maxDPR = Math.min(window.devicePixelRatio, 2);

    // Restore in reverse order
    if (this.config.particleCount < 1000) {
      this.config.particleCount = Math.min(1000, this.config.particleCount + 200);
      changed = true;
    }
    else if (!this.config.bloomEnabled) {
      this.config.bloomEnabled = true;
      changed = true;
    }
    else if (this.config.dpr < maxDPR) {
      this.config.dpr = Math.min(maxDPR, this.config.dpr + 0.5);
      changed = true;
    }
    else if (!this.config.chromaticAberrationEnabled) {
      this.config.chromaticAberrationEnabled = true;
      changed = true;
    }

    if (changed) {
      this.frameTimes = []; // Reset sampling
      this.onConfigChange(this.config);
    }
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  reset(): void {
    this.frameTimes = [];
  }
}

