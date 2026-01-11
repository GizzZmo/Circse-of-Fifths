import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicStateService } from '../services/music-state.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-circle-visual',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] mx-auto select-none my-8">
      
      <!-- Main Circle Background -->
      <div class="absolute inset-0 rounded-full border-4 border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        
        <!-- Rotating Wedge/Sector Highlight -->
        <div 
          class="absolute inset-0 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-center will-change-transform"
          [style.transform]="wedgeRotation()">
          
          <!-- Gradient Slice -->
          <div 
            class="w-full h-full opacity-25"
            style="background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 345deg, #3b82f6 345deg, #3b82f6 360deg, #3b82f6 0deg, #3b82f6 15deg, transparent 15deg);">
          </div>
        </div>
        
        <!-- Decoration Rings -->
        <div class="absolute inset-[20%] rounded-full border border-neutral-800/50"></div>
        <div class="absolute inset-[35%] rounded-full border border-neutral-800/30"></div>

      </div>

      <!-- Notes Layer -->
      <div class="absolute inset-0">
        <!-- Outer Ring (Major Scale Notes) -->
        @for (note of musicState.outerNotes; track $index) {
          <button
            (click)="selectKey($index, note)"
            class="absolute w-14 h-14 -ml-7 -mt-7 flex flex-col items-center justify-center rounded-full font-bold transition-all duration-300 z-20 cursor-pointer focus:outline-none outline-none tap-highlight-transparent"
            [style.left]="getPos($index, true).left"
            [style.top]="getPos($index, true).top"
            [class.bg-blue-500]="isOuterActive($index) && isTonic($index)"
            [class.text-white]="isOuterActive($index) && isTonic($index)"
            [class.scale-110]="isTonic($index)"
            [class.z-30]="isTonic($index)"
            
            [class.text-blue-400]="isOuterActive($index) && !isTonic($index)"
            [class.text-neutral-500]="!isOuterActive($index)"
            [class.bg-neutral-800]="!isTonic($index)"
            [class.hover:bg-neutral-700]="!isOuterActive($index)"
            [class.hover:text-neutral-300]="!isOuterActive($index)"
            [class.shadow-lg]="isOuterActive($index)"
            [class.shadow-blue-500_50]="isTonic($index)"
            [class.border]="!isTonic($index)"
            [class.border-neutral-700]="!isTonic($index)"
            [class.border-transparent]="isTonic($index)"
            [class.border-blue-900]="isOuterActive($index) && !isTonic($index)"
          >
            <span class="leading-none">{{ note }}</span>
            @if (getRoman($index, true); as roman) {
                <span class="text-[9px] font-serif font-normal leading-none mt-0.5 opacity-90">{{ roman }}</span>
            }
          </button>
        }

        <!-- Inner Ring (Minors) -->
        @for (note of musicState.innerNotes; track $index) {
          <button
            (click)="selectKey($index, note)"
            class="absolute w-10 h-10 -ml-5 -mt-5 flex flex-col items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all duration-300 z-10 cursor-pointer focus:outline-none outline-none tap-highlight-transparent"
            [style.left]="getPos($index, false).left"
            [style.top]="getPos($index, false).top"
            [class.text-rose-400]="isInnerActive($index)"
            [class.text-neutral-600]="!isInnerActive($index)"
            [class.font-bold]="isInnerActive($index)"
            [class.scale-110]="isInnerActive($index)"
            [class.hover:text-neutral-400]="!isInnerActive($index)"
          >
            <span class="leading-none">{{ note }}</span>
            @if (getRoman($index, false); as roman) {
                <span class="text-[8px] font-serif font-normal leading-none mt-0.5 opacity-80">{{ roman }}</span>
            }
          </button>
        }
      </div>

      <!-- Center Label -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="flex flex-col items-center justify-center opacity-30">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle></svg>
           <span class="text-[10px] uppercase tracking-[0.2em]">Fifths</span>
        </div>
      </div>

    </div>
  `
})
export class CircleVisualComponent {
  musicState = inject(MusicStateService);
  audioService = inject(AudioService);
  
  wedgeRotation = computed(() => {
    const idx = this.musicState.selectedIndex();
    return `rotate(${idx * 30}deg)`;
  });

  isTonic(index: number): boolean {
    return this.musicState.selectedIndex() === index;
  }

  isOuterActive(index: number): boolean {
    return this.musicState.scaleNoteIndices().includes(index);
  }

  isInnerActive(index: number): boolean {
    // Only highlight the primary relative minor chords (neighbors)
    return this.musicState.activeIndices().includes(index);
  }

  getRoman(index: number, isOuter: boolean): string {
    const current = this.musicState.selectedIndex();
    // Calculate distance on the circle (0 to 11)
    const diff = (index - current + 12) % 12;

    if (isOuter) {
      if (diff === 0) return 'I';
      if (diff === 1) return 'V';
      if (diff === 11) return 'IV';
    } else {
      if (diff === 0) return 'vi';
      if (diff === 1) return 'iii';
      if (diff === 11) return 'ii';
    }
    return '';
  }

  selectKey(index: number, note: string) {
    this.musicState.setIndex(index);
    
    let noteToPlay = note;
    if (note.endsWith('m') && note.length > 1 && note[1] !== 'b' && note[1] !== '#') {
        noteToPlay = note.slice(0, -1);
    } else if (note.endsWith('m')) {
       noteToPlay = note.slice(0, -1);
    }

    this.audioService.playNote(noteToPlay);
  }

  getPos(index: number, isOuter: boolean) {
    // Radius in percentage of container size
    const r = isOuter ? 41 : 27; 
    
    // -90deg offset to start at top
    const step = (2 * Math.PI) / 12;
    const offset = -Math.PI / 2;
    const angle = (index * step) + offset;
    
    // Center is 50%
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    
    return {
      left: `${x}%`,
      top: `${y}%`
    };
  }
}