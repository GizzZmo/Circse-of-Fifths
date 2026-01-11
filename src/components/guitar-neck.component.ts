import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../services/audio.service';
import { ScaleDegree } from '../services/music-state.service';

interface FretInfo {
  note: string;
  octave: number;
  display: string; // e.g. "C#"
  isRoot: boolean;
  degree?: string; // e.g. "3rd"
}

@Component({
  selector: 'app-guitar-neck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full max-w-2xl mx-auto bg-neutral-900 rounded-lg shadow-xl overflow-x-auto select-none border-t-4 border-neutral-800 p-4">
      
      <!-- Fret Numbers -->
      <div class="flex text-[10px] text-neutral-500 mb-1 pl-8 sm:pl-10">
        @for (fret of frets; track $index) {
          <div class="flex-1 text-center border-l border-transparent" [class.invisible]="$index === 0">{{ $index }}</div>
        }
      </div>

      <!-- Fretboard -->
      <div class="flex flex-col relative bg-[#2a2a2a] border border-neutral-800 rounded shadow-inner">
        
        <!-- Strings -->
        @for (string of strings; track $index) {
          <div class="flex relative h-8 items-center">
            
            <!-- String Line (Physical String) -->
            <div class="absolute inset-0 flex items-center px-1 pointer-events-none z-0">
               <!-- Gradient for metallic look, varying thickness -->
               <div class="w-full bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-sm opacity-80" [style.height.px]="$index + 1"></div>
            </div>

            <!-- Open String (Fret 0) -->
            <div class="w-8 sm:w-10 flex-shrink-0 z-10 flex justify-center border-r-2 border-neutral-600 bg-neutral-900 h-full items-center relative shadow-[4px_0_5px_-2px_rgba(0,0,0,0.5)]">
               @if(getNote(string.startNote, string.startOctave, 0); as info) {
                 <button 
                    (click)="play(info)"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all focus:outline-none z-20"
                    
                    [class.bg-amber-500]="isActive(info.note) && info.isRoot"
                    [class.text-black]="isActive(info.note) && info.isRoot"
                    [class.ring-2]="isActive(info.note) && info.isRoot"
                    [class.ring-amber-300]="isActive(info.note) && info.isRoot"
                    [class.scale-110]="isActive(info.note) && info.isRoot"
                    
                    [class.bg-blue-500]="isActive(info.note) && !info.isRoot"
                    [class.text-white]="isActive(info.note) && !info.isRoot"

                    [class.text-neutral-600]="!isActive(info.note)"
                    [class.bg-transparent]="!isActive(info.note)"
                    [class.hover:text-neutral-400]="!isActive(info.note)"
                 >
                   {{ info.display }}
                 </button>
               }
            </div>

            <!-- Frets 1-12 -->
            @for (fret of frets.slice(1); track fret) {
                <div class="flex-1 border-r border-neutral-600/50 h-full flex items-center justify-center relative z-10">
                    
                    <!-- Fret Marker Dots (Single) -->
                    <!-- Centered between G(2) and D(3) strings. We place it at bottom of G string row -->
                    @if (isSingleDot(fret) && $index === 2) {
                        <div class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-neutral-800/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] z-0 backdrop-blur-sm border border-white/5"></div>
                    }
                    
                    <!-- Fret Marker Dots (Double) -->
                    @if (fret === 12) {
                        <!-- Top dot between B(1) and G(2) -->
                        @if ($index === 1) {
                             <div class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-neutral-800/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] z-0 backdrop-blur-sm border border-white/5"></div>
                        }
                        <!-- Bottom dot between D(3) and A(4) -->
                        @if ($index === 3) {
                             <div class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-neutral-800/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] z-0 backdrop-blur-sm border border-white/5"></div>
                        }
                    }

                    <!-- Note Button -->
                    @if(getNote(string.startNote, string.startOctave, fret); as info) {
                        <button 
                            (click)="play(info)"
                            class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all focus:outline-none z-20"
                            
                            [class.bg-amber-500]="isActive(info.note) && info.isRoot"
                            [class.text-black]="isActive(info.note) && info.isRoot"
                            [class.ring-4]="isActive(info.note) && info.isRoot"
                            [class.ring-amber-500/30]="isActive(info.note) && info.isRoot"
                            [class.shadow-lg]="isActive(info.note) && info.isRoot"
                            [class.shadow-amber-500/50]="isActive(info.note) && info.isRoot"
                            [class.scale-110]="isActive(info.note) && info.isRoot"
                            [class.z-30]="isActive(info.note) && info.isRoot"

                            [class.bg-blue-600]="isActive(info.note) && !info.isRoot"
                            [class.text-white]="isActive(info.note) && !info.isRoot"
                            [class.shadow-md]="isActive(info.note) && !info.isRoot"
                            [class.hover:scale-110]="isActive(info.note)"
                            [class.hover:bg-blue-500]="isActive(info.note) && !info.isRoot"

                            [class.text-neutral-600]="!isActive(info.note)"
                            [class.bg-transparent]="!isActive(info.note)"
                            [class.hover:text-neutral-400]="!isActive(info.note)"
                            [class.hover:bg-neutral-800/50]="!isActive(info.note)"
                        >
                            {{ info.display }}
                        </button>
                    }
                </div>
            }

          </div>
        }
      </div>
      
    </div>
  `
})
export class GuitarNeckComponent {
  scale = input<ScaleDegree[]>([]);
  audioService = inject(AudioService);

  frets = Array.from({length: 13}, (_, i) => i); // 0 to 12

  // Standard Tuning: High E to Low E
  strings = [
    { startNote: 'E', startOctave: 4 },
    { startNote: 'B', startOctave: 3 },
    { startNote: 'G', startOctave: 3 },
    { startNote: 'D', startOctave: 3 },
    { startNote: 'A', startOctave: 2 },
    { startNote: 'E', startOctave: 2 },
  ];

  private readonly notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  private readonly enharmonicMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#',
    'Cb': 'B', 'E#': 'F', 'B#': 'C', 'Fb': 'E'
  };

  activeNotesSet = computed(() => {
    const s = this.scale();
    const set = new Set<string>();
    s.forEach(d => {
      set.add(this.normalize(d.note));
    });
    return set;
  });

  rootNote = computed(() => {
      const s = this.scale();
      if (s.length > 0) return this.normalize(s[0].note);
      return '';
  });

  getNote(startNote: string, startOctave: number, fret: number): FretInfo {
    const startIndex = this.notes.indexOf(this.normalize(startNote));
    const absIndex = startIndex + fret;
    const noteIndex = absIndex % 12;
    const octaveShift = Math.floor(absIndex / 12);
    
    const noteName = this.notes[noteIndex];
    const octave = startOctave + octaveShift;

    // Determine if it matches current scale
    const normNote = noteName; // Already normalized as we pull from this.notes (sharps)

    return {
        note: normNote,
        octave: octave,
        display: noteName,
        isRoot: normNote === this.rootNote()
    };
  }

  isActive(note: string): boolean {
      return this.activeNotesSet().has(note);
  }

  play(info: FretInfo) {
      this.audioService.playNote(info.note + info.octave);
  }

  normalize(note: string): string {
    if (this.enharmonicMap[note]) return this.enharmonicMap[note];
    return note;
  }

  isSingleDot(fret: number): boolean {
      return [3, 5, 7, 9].includes(fret);
  }
}