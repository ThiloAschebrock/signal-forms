import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LinksComponent } from './components/links/links.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LinksComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
