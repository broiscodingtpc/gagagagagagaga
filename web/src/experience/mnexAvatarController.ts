export class MnexAvatarController {
  private energy: number = 0.65;
  private pulse: boolean = false;
  private flare: boolean = false;
  private glitch: boolean = false;
  
  // Smooth parameters for shader
  private smoothEnergy: number = 0.65;
  private smoothPulse: number = 0;
  private smoothFlare: number = 0;
  private smoothGlitch: number = 0;
  
  // Animation state
  private time: number = 0;
  private glitchPhase: number = 0;
  
  update(deltaTime: number, controlState: {
    energy: number;
    pulse: boolean;
    flare: boolean;
    glitch: boolean;
  }) {
    this.time += deltaTime;
    
    // Update state
    this.energy = controlState.energy;
    this.pulse = controlState.pulse;
    this.flare = controlState.flare;
    this.glitch = controlState.glitch;
    
    // Smooth energy transition (400ms ease)
    const energyTarget = this.energy;
    const energyDiff = energyTarget - this.smoothEnergy;
    this.smoothEnergy += energyDiff * Math.min(1, deltaTime * 2.5); // 2.5 = 1/0.4s
    
    // Pulse breathing scale + emission boost
    if (this.pulse) {
      this.smoothPulse = 0.5 + 0.5 * Math.sin(this.time * 3.0);
    } else {
      this.smoothPulse *= 0.95; // fade out
    }
    
    // Flare rim/intensity spikes
    if (this.flare) {
      this.smoothFlare = Math.min(1, this.smoothFlare + deltaTime * 4);
    } else {
      this.smoothFlare *= 0.9; // fade out
    }
    
    // Glitch micro jitter
    if (this.glitch) {
      this.glitchPhase += deltaTime * 8;
      this.smoothGlitch = 0.3 + 0.2 * Math.sin(this.glitchPhase * 7.3);
    } else {
      this.smoothGlitch *= 0.85; // fade out
    }
  }
  
  getShaderUniforms() {
    return {
      uEnergy: this.smoothEnergy,
      uPulse: this.smoothPulse,
      uFlare: this.smoothFlare,
      uGlitch: this.smoothGlitch,
      uTime: this.time
    };
  }
  
  getHeadOffset() {
    // Micro jitter for glitch effect
    if (this.smoothGlitch > 0.1) {
      return {
        x: (Math.random() - 0.5) * 0.02 * this.smoothGlitch,
        y: (Math.random() - 0.5) * 0.02 * this.smoothGlitch
      };
    }
    return { x: 0, y: 0 };
  }
}
