import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  loading = input(false);
  search = output<string>();
}
