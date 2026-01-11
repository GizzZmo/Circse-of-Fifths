import { Component } from '@angular/core';
import { CircleVisualComponent } from './components/circle-visual.component';
import { ChordPanelComponent } from './components/chord-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircleVisualComponent, ChordPanelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}