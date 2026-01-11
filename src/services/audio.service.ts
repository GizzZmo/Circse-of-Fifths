import { Injectable } from '@angular/core';

// Declare the global class from the script tag
declare class WebAudioTinySynth {
  constructor(options?: any);
  setProgram(channel: number, program: number): void;
  send(data: number[]): void;
  getAudioContext(): AudioContext;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private synth: WebAudioTinySynth | null = null;
  private isInitialized = false;
  private currentProgram = 0; // Default Piano
  private progressionTimeout: any = null;

  private readonly noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  async init() {
    if (this.isInitialized && this.synth) return;
    
    // Initialize GM Synth with high quality, Reverb, and higher polyphony
    this.synth = new WebAudioTinySynth({ 
      quality: 1,
      useReverb: 1,
      voices: 64
    });
    
    // Ensure instrument is set and GM2 mode is active
    if (this.synth) {
       // Send GM2 System On Sysex Message: F0 7E 7F 09 03 F7
       this.synth.send([0xF0, 0x7E, 0x7F, 0x09, 0x03, 0xF7]);
       
       // Setup Channel 0 defaults
       this.synth.setProgram(0, this.currentProgram);
       this.synth.send([0xB0, 7, 100]);  // Volume (CC 7)
       this.synth.send([0xB0, 91, 40]);  // Reverb Depth (CC 91)
       this.synth.send([0xB0, 10, 64]);  // Pan Center (CC 10)
    }

    this.isInitialized = true;
  }

  // Ensure AudioContext is resumed (browser autoplay policy)
  private async ensureContext() {
    await this.init();
    if (this.synth) {
      const ctx = this.synth.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
    }
  }

  setInstrument(programNumber: number) {
    this.currentProgram = programNumber;
    if (this.synth) {
      // Channel 0
      this.synth.send([0xC0, programNumber]);
    }
  }

  async playNote(note: string, velocity = 100, durationMs = 500) {
    await this.ensureContext();
    if (!this.synth) return;

    const midi = this.getMidi(note);
    // Note On: 0x90, note, velocity
    this.synth.send([0x90, midi, velocity]);
    
    // Note Off after duration
    setTimeout(() => {
      this.synth?.send([0x80, midi, 0]);
    }, durationMs);
  }

  async playChord(notes: string[], velocity = 100, durationMs = 1500) {
    await this.ensureContext();
    if (!this.synth) return;

    const midis = notes.map(n => this.getMidi(n));
    
    // All notes on
    midis.forEach(m => this.synth?.send([0x90, m, velocity]));

    // All notes off
    setTimeout(() => {
      midis.forEach(m => this.synth?.send([0x80, m, 0]));
    }, durationMs);
  }

  async playProgression(chords: string[][]) {
    await this.ensureContext();
    if (!this.synth) return;

    // Cancel previous progression if any
    if (this.progressionTimeout) {
      clearTimeout(this.progressionTimeout);
      this.progressionTimeout = null;
    }

    const stepDuration = 1000; // ms per chord

    chords.forEach((chordNotes, index) => {
      const timeoutId = setTimeout(() => {
        this.playChord(chordNotes, 90, stepDuration - 100);
      }, index * stepDuration);
      
      // Keep track of last one to clear if needed, 
      // though simple overlapping handling requires more complex logic.
      // This simple approach works for linear playback.
      this.progressionTimeout = timeoutId;
    });
  }

  private getMidi(note: string): number {
    // Regex to parse "C#4", "Db3", "C", "F#"
    const match = note.match(/^([A-G][#b]?)(-?\d+)?$/);
    if (!match) return 60; // Default C4 if parse fails
    
    const name = match[1];
    const octStr = match[2];
    
    // Default octave 4 if not specified
    const octave = octStr ? parseInt(octStr, 10) : 4;
    
    const semitone = this.noteMap[name];
    if (semitone === undefined) return 60;
    
    // MIDI note calculation: (Octave + 1) * 12 + Semitone
    // C4 = (4+1)*12 + 0 = 60
    return (octave + 1) * 12 + semitone;
  }
}