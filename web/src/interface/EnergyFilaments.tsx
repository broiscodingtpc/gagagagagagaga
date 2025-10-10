/**
 * Energy Filaments - Living connections between AI head and UI elements
 * Subtle energy threads that pulse and react to AI state
 */

import * as THREE from 'three';
import type { MnexControlState } from './useMnexControl';

export class EnergyFilaments {
  public group: THREE.Group;
  private lines: THREE.Line[] = [];
  private materials: THREE.LineBasicMaterial[] = [];
  private time = 0;

  constructor() {
    this.group = new THREE.Group();
    
    // Create filaments to button positions (right side of screen)
    // Approximate positions - will adjust based on screen
    const buttonPositions = [
      { x: 0.7, y: 0.4, z: -1 },   // Top button
      { x: 0.7, y: 0.2, z: -1 },   // Second button
      { x: 0.7, y: 0.0, z: -1 },   // Third button
      { x: 0.7, y: -0.2, z: -1 }   // Bottom button
    ];

    buttonPositions.forEach((targetPos, index) => {
      const filament = this.createFilament(targetPos, index);
      this.lines.push(filament);
      this.group.add(filament);
    });
  }

  private createFilament(target: { x: number; y: number; z: number }, index: number): THREE.Line {
    // Create curved path from head center to button
    const points: THREE.Vector3[] = [];
    const segments = 30;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Bezier curve for organic feel
      const x = t * target.x;
      const y = t * target.y + Math.sin(t * Math.PI) * 0.15; // Arc
      const z = t * target.z;
      
      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x7c3aed),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    this.materials.push(material);
    
    return new THREE.Line(geometry, material);
  }

  update(deltaTime: number, control: MnexControlState): void {
    this.time += deltaTime;

    // Animate filament opacity based on AI state
    const baseOpacity = 0.10 + (control.energy / 100) * 0.15;
    const pulseOpacity = Math.sin(this.time * 1.5) * 0.05;
    const thinkingBoost = control.thinking ? 0.15 : 0.0;
    const speakingBoost = control.speaking ? 0.10 : 0.0;

    this.materials.forEach((material, index) => {
      const phaseShift = index * 0.5;
      const opacity = baseOpacity + 
                     pulseOpacity * Math.sin(this.time * 2.0 + phaseShift) +
                     thinkingBoost +
                     speakingBoost * Math.sin(this.time * 5.0 + phaseShift);
      
      material.opacity = Math.max(0.05, Math.min(0.35, opacity));
      
      // Color shifts with emotion
      const emotionHue = this.getEmotionHue(control.emotion);
      material.color.setHSL(emotionHue, 0.7, 0.5);
    });

    // Subtle movement of line points (breathing effect)
    this.lines.forEach((line, lineIndex) => {
      const positions = line.geometry.attributes.position;
      const array = positions.array as Float32Array;
      
      for (let i = 0; i < positions.count; i++) {
        const idx = i * 3;
        const t = i / positions.count;
        
        // Subtle wave motion
        const wave = Math.sin(this.time * 2.0 + t * Math.PI * 2 + lineIndex) * 0.01;
        array[idx + 1] += wave * deltaTime * 10; // Y position
      }
      
      positions.needsUpdate = true;
    });
  }

  private getEmotionHue(emotion: 'calm' | 'alert' | 'intense'): number {
    switch (emotion) {
      case 'calm': return 0.75; // Blue-purple
      case 'alert': return 0.85; // Magenta
      case 'intense': return 0.92; // Pink
      default: return 0.75;
    }
  }

  updateButtonPositions(positions: THREE.Vector3[]): void {
    // Update filament endpoints if button positions change
    positions.forEach((pos, index) => {
      if (index < this.lines.length) {
        const line = this.lines[index];
        const geometry = line.geometry;
        const posAttr = geometry.attributes.position;
        const array = posAttr.array as Float32Array;
        
        // Update last point (endpoint)
        const lastIdx = (posAttr.count - 1) * 3;
        array[lastIdx] = pos.x;
        array[lastIdx + 1] = pos.y;
        array[lastIdx + 2] = pos.z;
        
        posAttr.needsUpdate = true;
      }
    });
  }

  dispose(): void {
    this.lines.forEach(line => {
      line.geometry.dispose();
    });
    this.materials.forEach(mat => mat.dispose());
  }
}

