import { Component, inject, signal } from '@angular/core';
import { AiService } from '../../services/ai.service';
import { SearchBar } from '../../components/search-bar/search-bar';
import { ProductList } from '../../components/product-list/product-list';

@Component({
  imports: [SearchBar, ProductList],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private aiService = inject(AiService);
  products = signal<any[]>([]);
  errorMessage = signal<string>('');

  async handleSearch(query: string) {
    if (!query) return;
    this.products.set([]);
    this.errorMessage.set('');

    const aiResults = await this.aiService.getTopProducts(query);
    if (aiResults.length === 0) {
      this.errorMessage.set('The AI is currently too busy. Please try again in a minute!');
    } else {
      this.products.set(aiResults);
    }
  }
}
