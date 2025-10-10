/**
 * Audio Reactivity System
 * Optional mic/audio input for visual modulation
 */

export interface AudioReactData {
  amplitude: number; // 0-1
  frequency: number; // 0-1
  enabled: boolean;
}

export class AudioReactivity {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  private enabled = false;

  async enable(): Promise<boolean> {
    if (this.enabled) return true;

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect microphone
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      // Setup data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.enabled = true;
      return true;
    } catch (error) {
      console.warn('[AudioReact] Failed to enable:', error);
      return false;
    }
  }

  disable(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.enabled = false;
  }

  getData(): AudioReactData {
    if (!this.enabled || !this.analyser || !this.dataArray) {
      return { amplitude: 0, frequency: 0, enabled: false };
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average amplitude
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    const amplitude = sum / (this.dataArray.length * 255);

    // Calculate dominant frequency (simplified)
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const frequency = maxIndex / this.dataArray.length;

    return {
      amplitude: Math.min(1, amplitude * 2), // Boost sensitivity
      frequency,
      enabled: true
    };
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): Promise<boolean> {
    if (this.enabled) {
      this.disable();
      return Promise.resolve(false);
    } else {
      return this.enable();
    }
  }
}

