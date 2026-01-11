import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicStateService, ChordDetail } from '../services/music-state.service';
import { AudioService } from '../services/audio.service';
import { PianoKeyboardComponent } from './piano-keyboard.component';
import { GuitarNeckComponent } from './guitar-neck.component';

@Component({
  selector: 'app-chord-panel',
  standalone: true,
  imports: [CommonModule, PianoKeyboardComponent, GuitarNeckComponent, FormsModule],
  template: `
    <div class="bg-neutral-800/50 backdrop-blur-md rounded-2xl p-6 border border-neutral-700/50 shadow-xl w-full max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="text-center mb-8 relative">
        <p class="text-neutral-400 text-sm uppercase tracking-wider mb-1">Current Key</p>
        <h2 class="text-4xl font-bold text-white flex items-center justify-center gap-2">
          <span class="text-blue-500">{{ key().tonic }}</span> 
          <span>Major</span>
        </h2>
        
        <div class="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
            
            <!-- Instrument Selector -->
            <div class="relative">
              <select 
                [ngModel]="selectedInstrument" 
                (ngModelChange)="onInstrumentChange($event)"
                class="appearance-none bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-full px-4 py-2 pr-8 hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                @for (inst of instruments; track inst.program) {
                  <option [value]="inst.program">{{ inst.name }}</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button (click)="playProgression()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Play Diatonic Chords
            </button>
        </div>

        <div class="mt-4 text-neutral-500 text-sm flex gap-2 justify-center">
            <span class="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">Relative Minor: <span class="text-rose-400">{{ key().chords.vi.name }}</span> <span class="text-neutral-500 text-xs font-serif ml-1">vi</span></span>
        </div>
      </div>

      <!-- Instrument Visualizations -->
      <div class="mb-8">
        <div class="flex items-center justify-between pb-2 border-b border-neutral-700/50 mb-4">
            <span class="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Visualizations</span>
            <div class="flex gap-2 text-[10px] font-bold">
                <button 
                    (click)="activeTab.set('piano')" 
                    class="px-2 py-1 rounded transition-colors"
                    [class.bg-neutral-700]="activeTab() === 'piano'"
                    [class.text-white]="activeTab() === 'piano'"
                    [class.text-neutral-500]="activeTab() !== 'piano'"
                >PIANO</button>
                <button 
                    (click)="activeTab.set('guitar')" 
                    class="px-2 py-1 rounded transition-colors"
                    [class.bg-neutral-700]="activeTab() === 'guitar'"
                    [class.text-white]="activeTab() === 'guitar'"
                    [class.text-neutral-500]="activeTab() !== 'guitar'"
                >GUITAR</button>
            </div>
        </div>
        
        @if (activeTab() === 'piano') {
            <app-piano-keyboard [scale]="key().scale" />
        } @else {
            <app-guitar-neck [scale]="key().scale" />
        }
      </div>

      <!-- Major Scale List -->
      <div class="mb-8">
        <div class="pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-widest border-b border-neutral-700/50 mb-4 flex justify-between items-center">
          <div class="flex flex-col">
              <span>Major Scale Notes</span>
              <span class="text-[9px] text-neutral-500 normal-case tracking-normal">Relationship to Tonic</span>
          </div>
          <span class="text-[10px] text-neutral-600">Click note to listen</span>
        </div>
        <div class="flex flex-wrap justify-center gap-2 md:gap-4">
          @for (degree of key().scale; track $index) {
            <button 
                (click)="playNote(degree.note)"
                class="group flex flex-col items-center bg-neutral-900/80 border border-neutral-700 hover:border-blue-500 hover:bg-neutral-800 rounded-lg p-2 min-w-[3.5rem] transition-all cursor-pointer">
              <span class="text-lg font-bold text-white group-hover:text-blue-400">{{ degree.note }}</span>
              <span class="text-[10px] text-neutral-500 uppercase">{{ degree.interval }}</span>
              <span class="text-[10px] text-neutral-400 font-serif mt-1">{{ degree.roman }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Chords Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        
        <!-- PRIMARY CHORDS (Major) -->
        <div class="col-span-2 md:col-span-3 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-widest border-b border-neutral-700/50 mb-2 mt-2">
            Primary Chords <span class="text-[10px] lowercase font-normal ml-2 opacity-50">(click to play)</span>
        </div>

        <!-- I Chord -->
        <div (click)="playChord(key().chords.I)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-blue-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-blue-400 font-bold tracking-wider">TONIC</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">I</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.I.name }}
          </div>
        </div>

        <!-- IV Chord -->
        <div (click)="playChord(key().chords.IV)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-blue-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-blue-400 font-bold tracking-wider">SUBDOMINANT</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">IV</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.IV.name }}
          </div>
        </div>

        <!-- V Chord -->
        <div (click)="playChord(key().chords.V)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-blue-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-blue-400 font-bold tracking-wider">DOMINANT</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">V</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.V.name }}
          </div>
        </div>

        <!-- SECONDARY CHORDS (Minor) -->
        <div class="col-span-2 md:col-span-3 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-widest border-b border-neutral-700/50 mb-2 mt-6">
            Secondary Chords
        </div>

        <!-- vi Chord -->
        <div (click)="playChord(key().chords.vi)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-rose-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-rose-400 font-bold tracking-wider">SUBMEDIANT</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">vi</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.vi.name }}
          </div>
        </div>

        <!-- ii Chord -->
        <div (click)="playChord(key().chords.ii)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-rose-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-rose-400 font-bold tracking-wider">SUPERTONIC</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">ii</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.ii.name }}
          </div>
        </div>

        <!-- iii Chord -->
        <div (click)="playChord(key().chords.iii)" class="cursor-pointer group relative overflow-hidden bg-neutral-900 border-l-4 border-rose-500 rounded-r-lg p-4 transition-all hover:bg-neutral-800 active:scale-95">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-rose-400 font-bold tracking-wider">MEDIANT</span>
            <span class="px-2 py-0.5 rounded text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 font-serif font-bold min-w-[1.5rem] text-center">iii</span>
          </div>
          <div class="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
            {{ key().chords.iii.name }}
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-8 pt-4 border-t border-neutral-700/30 text-center text-xs text-neutral-600">
         <p>The <strong>vii°</strong> (diminished) chord is omitted for clarity, but is always a semitone below the tonic.</p>
      </div>

    </div>
  `
})
export class ChordPanelComponent {
  musicState = inject(MusicStateService);
  audioService = inject(AudioService);
  key = this.musicState.currentKey;
  activeTab = signal<'piano' | 'guitar'>('piano');

  selectedInstrument = 0; // Default Piano
  
  instruments = [
    { name: 'Grand Piano', program: 0 },
    { name: 'Bright Piano', program: 1 },
    { name: 'Electric Piano', program: 4 },
    { name: 'Harpsichord', program: 6 },
    { name: 'Drawbar Organ', program: 16 },
    { name: 'Nylon Guitar', program: 24 },
    { name: 'Steel Guitar', program: 25 },
    { name: 'Jazz Guitar', program: 26 },
    { name: 'Overdrive Gtr', program: 29 },
    { name: 'Acoustic Bass', program: 32 },
    { name: 'Violin', program: 40 },
    { name: 'Cello', program: 42 },
    { name: 'Orchestral Harp', program: 46 },
    { name: 'Strings', program: 48 },
    { name: 'Choir Aahs', program: 52 },
    { name: 'Trumpet', program: 56 },
    { name: 'Alto Sax', program: 65 },
    { name: 'Clarinet', program: 71 },
    { name: 'Flute', program: 73 },
    { name: 'Synth Pad (Warm)', program: 89 }
  ];

  onInstrumentChange(program: number) {
    this.selectedInstrument = Number(program);
    this.audioService.setInstrument(this.selectedInstrument);
  }

  playNote(note: string) {
    this.audioService.playNote(note);
  }

  playChord(chord: ChordDetail) {
    this.audioService.playChord(chord.notes);
  }

  playProgression() {
    const k = this.key();
    // Play sequential diatonic chords: I, ii, iii, IV, V, vi, I
    const progression = [
        k.chords.I.notes,
        k.chords.ii.notes,
        k.chords.iii.notes,
        k.chords.IV.notes,
        k.chords.V.notes,
        k.chords.vi.notes,
        k.chords.I.notes
    ];
    this.audioService.playProgression(progression);
  }
}