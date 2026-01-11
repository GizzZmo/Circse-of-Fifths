import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../services/audio.service';
import { ScaleDegree } from '../services/music-state.service';

interface KeyConfig {
  note: string;
  octave: number;
  label: string;
  leftPct?: number; // For black keys
}

@Component({
  selector: 'app-piano-keyboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full max-w-2xl mx-auto h-36 bg-neutral-900 rounded-lg shadow-xl overflow-hidden select-none border-t-4 border-neutral-800">
      
      <!-- White Keys -->
      <div class="flex h-full w-full">
        @for (key of whiteKeys; track $index) {
          <button 
            (mousedown)="play(key)"
            class="relative flex-1 h-full border-r border-neutral-300 last:border-0 rounded-b active:bg-blue-200 transition-colors flex items-end justify-center pb-2 z-10 focus:outline-none"
            [class.bg-blue-100]="isActive(key.note)"
            [class.bg-white]="!isActive(key.note)"
          >
            <span 
              class="text-[10px] sm:text-xs font-bold transition-colors"
              [class.text-blue-600]="isActive(key.note)"
              [class.text-neutral-400]="!isActive(key.note)"
            >
              {{ key.label }}
            </span>
            
            <!-- Highlight dot for active notes -->
            @if(isActive(key.note)) {
                <div class="absolute bottom-6 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            }
          </button>
        }
      </div>

      <!-- Black Keys -->
      <div class="absolute inset-0 pointer-events-none w-full h-full">
        @for (key of blackKeys; track $index) {
          <div 
            class="absolute h-[60%] w-[4%] -ml-[2%] z-20 pointer-events-auto"
            [style.left.%]="key.leftPct"
          >
             <button
                (mousedown)="play(key)"
                class="w-full h-full rounded-b border-x border-b border-neutral-950 shadow-lg active:bg-blue-400 transition-colors focus:outline-none"
                [class.bg-blue-500]="isActive(key.note)"
                [class.bg-neutral-800]="!isActive(key.note)"
             >
             </button>
          </div>
        }
      </div>
      
    </div>
  `
})
export class PianoKeyboardComponent {
  scale = input<ScaleDegree[]>([]);
  audioService = inject(AudioService);

  private readonly enharmonicMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#',
    // Rarer ones if needed, though simple map covers 99% of circle of fifths standard use
    'Cb': 'B', 'E#': 'F', 'B#': 'C', 'Fb': 'E'
  };

  activeNotes = computed(() => {
    const s = this.scale();
    const set = new Set<string>();
    s.forEach(d => {
      // Normalize to match keyboard keys (which are C, C#, D...)
      set.add(this.normalize(d.note));
    });
    return set;
  });

  // Generate 2 octaves: C3 to B4
  // 14 White keys
  whiteKeys: KeyConfig[] = [
    { note: 'C', octave: 3, label: 'C3' }, { note: 'D', octave: 3, label: 'D' }, { note: 'E', octave: 3, label: 'E' },
    { note: 'F', octave: 3, label: 'F' }, { note: 'G', octave: 3, label: 'G' }, { note: 'A', octave: 3, label: 'A' }, { note: 'B', octave: 3, label: 'B' },
    { note: 'C', octave: 4, label: 'C4' }, { note: 'D', octave: 4, label: 'D' }, { note: 'E', octave: 4, label: 'E' },
    { note: 'F', octave: 4, label: 'F' }, { note: 'G', octave: 4, label: 'G' }, { note: 'A', octave: 4, label: 'A' }, { note: 'B', octave: 4, label: 'B' }
  ];

  // Black keys positions relative to 14 white keys
  // 100% / 14 keys = 7.1428% per key
  // Positions are at the boundary lines: 1, 2, 4, 5, 6, 8, 9, 11, 12, 13
  blackKeys: KeyConfig[] = [
    { note: 'C#', octave: 3, label: '', leftPct: 1 * 7.1428 },
    { note: 'D#', octave: 3, label: '', leftPct: 2 * 7.1428 },
    { note: 'F#', octave: 3, label: '', leftPct: 4 * 7.1428 },
    { note: 'G#', octave: 3, label: '', leftPct: 5 * 7.1428 },
    { note: 'A#', octave: 3, label: '', leftPct: 6 * 7.1428 },
    { note: 'C#', octave: 4, label: '', leftPct: 8 * 7.1428 },
    { note: 'D#', octave: 4, label: '', leftPct: 9 * 7.1428 },
    { note: 'F#', octave: 4, label: '', leftPct: 11 * 7.1428 },
    { note: 'G#', octave: 4, label: '', leftPct: 12 * 7.1428 },
    { note: 'A#', octave: 4, label: '', leftPct: 13 * 7.1428 },
  ];

  isActive(note: string): boolean {
    return this.activeNotes().has(this.normalize(note));
  }

  play(key: KeyConfig) {
    this.audioService.playNote(key.note + key.octave);
  }

  private normalize(note: string): string {
    if (this.enharmonicMap[note]) return this.enharmonicMap[note];
    return note;
  }
}