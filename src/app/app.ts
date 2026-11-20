import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  title = signal('AI Top 10 Recommender');

  products = [
    { name: 'Awesome Tent', description: 'A great tent for 4 people.' },
    { name: 'Warm Sleeping Bag', description: 'Keeps you warm down to 0 degrees.' }
  ];

  searchProducts(query: string) {
    console.log('User wants to search for:', query);
    // In the next step, we will ask the AI for real data here!
  }
}
