import { Injectable, signal, computed } from '@angular/core';

export interface ChordDetail {
  roman: string;
  name: string;
  function: string;
  type: 'major' | 'minor' | 'diminished';
  isMajor: boolean;
  notes: string[]; // Notes in the chord
}

export interface ScaleDegree {
  degree: string;
  note: string;
  interval: string;
  roman: string;
}

export interface KeyState {
  tonic: string;
  index: number;
  scale: ScaleDegree[];
  chords: {
    I: ChordDetail;
    IV: ChordDetail;
    V: ChordDetail;
    vi: ChordDetail;
    ii: ChordDetail;
    iii: ChordDetail;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MusicStateService {
  // Clockwise starting from C at 12 o'clock
  readonly outerNotes = ["C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab", "Eb", "Bb", "F"];
  readonly innerNotes = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "Ebm", "Bbm", "Fm", "Cm", "Gm", "Dm"];

  // Hardcoded scales to ensure correct enharmonic spelling
  private readonly scaleMap: Record<string, string[]> = {
    "C": ["C", "D", "E", "F", "G", "A", "B"],
    "G": ["G", "A", "B", "C", "D", "E", "F#"],
    "D": ["D", "E", "F#", "G", "A", "B", "C#"],
    "A": ["A", "B", "C#", "D", "E", "F#", "G#"],
    "E": ["E", "F#", "G#", "A", "B", "C#", "D#"],
    "B": ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
    "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
    "F": ["F", "G", "A", "Bb", "C", "D", "E"]
  };

  // State
  readonly selectedIndex = signal<number>(0);

  // Computed State
  readonly currentKey = computed<KeyState>(() => {
    const idx = this.selectedIndex();
    
    // Helper to wrap indices (0-11)
    const getIdx = (i: number) => (i + 12) % 12;

    const i_idx = idx;
    const iv_idx = getIdx(idx - 1); // Counter-clockwise
    const v_idx = getIdx(idx + 1);  // Clockwise
    
    const vi_idx = idx;
    const ii_idx = getIdx(idx - 1);
    const iii_idx = getIdx(idx + 1);

    const tonic = this.outerNotes[i_idx];
    const scaleNotes = this.scaleMap[tonic] || [];

    // Helper to build chords from scale
    // I: 1-3-5
    // IV: 4-6-1
    // V: 5-7-2
    // vi: 6-1-3
    // ii: 2-4-6
    // iii: 3-5-7
    const getChordNotes = (degrees: number[]) => degrees.map(d => scaleNotes[d - 1]);

    const scale: ScaleDegree[] = [
      { degree: '1st', note: scaleNotes[0], interval: 'Root', roman: 'I' },
      { degree: '2nd', note: scaleNotes[1], interval: 'Major 2nd', roman: 'ii' },
      { degree: '3rd', note: scaleNotes[2], interval: 'Major 3rd', roman: 'iii' },
      { degree: '4th', note: scaleNotes[3], interval: 'Perfect 4th', roman: 'IV' },
      { degree: '5th', note: scaleNotes[4], interval: 'Perfect 5th', roman: 'V' },
      { degree: '6th', note: scaleNotes[5], interval: 'Major 6th', roman: 'vi' },
      { degree: '7th', note: scaleNotes[6], interval: 'Major 7th', roman: 'vii°' },
    ];

    return {
      tonic,
      index: i_idx,
      scale,
      chords: {
        I: { 
          roman: 'I', 
          name: this.outerNotes[i_idx], 
          function: 'Tonic', 
          type: 'major', 
          isMajor: true,
          notes: getChordNotes([1, 3, 5])
        },
        IV: { 
          roman: 'IV', 
          name: this.outerNotes[iv_idx], 
          function: 'Subdominant', 
          type: 'major', 
          isMajor: true,
          notes: getChordNotes([4, 6, 1])
        },
        V: { 
          roman: 'V', 
          name: this.outerNotes[v_idx], 
          function: 'Dominant', 
          type: 'major', 
          isMajor: true,
          notes: getChordNotes([5, 7, 2])
        },
        vi: { 
          roman: 'vi', 
          name: this.innerNotes[vi_idx], 
          function: 'Submediant', 
          type: 'minor', 
          isMajor: false,
          notes: getChordNotes([6, 1, 3])
        },
        ii: { 
          roman: 'ii', 
          name: this.innerNotes[ii_idx], 
          function: 'Supertonic', 
          type: 'minor', 
          isMajor: false,
          notes: getChordNotes([2, 4, 6])
        },
        iii: { 
          roman: 'iii', 
          name: this.innerNotes[iii_idx], 
          function: 'Mediant', 
          type: 'minor', 
          isMajor: false,
          notes: getChordNotes([3, 5, 7])
        }
      }
    };
  });

  // Primary chords (neighbors)
  readonly activeIndices = computed(() => {
    const idx = this.selectedIndex();
    const getIdx = (i: number) => (i + 12) % 12;
    return [
        getIdx(idx),     // I
        getIdx(idx - 1), // IV
        getIdx(idx + 1)  // V
    ];
  });

  // All 7 notes of the scale (Contiguous block from index-1 to index+5)
  readonly scaleNoteIndices = computed(() => {
    const idx = this.selectedIndex();
    const getIdx = (i: number) => (i + 12) % 12;
    return [
      getIdx(idx - 1), // F (in C)
      getIdx(idx),     // C
      getIdx(idx + 1), // G
      getIdx(idx + 2), // D
      getIdx(idx + 3), // A
      getIdx(idx + 4), // E
      getIdx(idx + 5)  // B
    ];
  });

  setIndex(index: number) {
    this.selectedIndex.set(index);
  }
}