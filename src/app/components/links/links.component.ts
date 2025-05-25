import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-links',
  imports: [RouterLink],
  templateUrl: './links.component.html',
  styleUrl: './links.component.scss',
})
export class LinksComponent {
  readonly links = [
    '/page1',
    '/page2',
    '/quote',
    '/quote/page3',
    '/quote/page4',
    '/quote/my/page5',
  ];
}
