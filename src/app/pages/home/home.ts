import { afterNextRender, Component, inject, Injector, signal } from '@angular/core';
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
  private injector = inject(Injector);
  private aiService = inject(AiService);
  products = signal<any[]>([]);
  errorMessage = signal<string>('');
  isLoading = signal(false);

  async handleSearch(query: string) {
    if (!query.trim() || this.isLoading()) return;

    this.products.set([]);
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const aiResults = await this.aiService.getTopProducts(query.trim());
      if (aiResults.length === 0) {
        this.errorMessage.set(
          "Amazon UK didn't find new products for that search. Try a broader category or simpler search terms."
        );
        return;
      }

      this.products.set(aiResults);
      afterNextRender(
        {
          mixedReadWrite: () => {
            document.getElementById('first-product')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          },
        },
        { injector: this.injector }
      );
    } catch (error) {
      console.error('Error generating product guide:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'We could not generate your guide. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
