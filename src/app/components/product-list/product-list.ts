import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList {
  products = input<any[]>([]);

  getAmazonUrl(productName: string): string {
    const myAffiliateTag = 'your-store-tag-20';
    return `https://www.amazon.co.uk/s?k=${encodeURIComponent(productName)}&tag=${myAffiliateTag}`;
  }

  printToPdf() {
    window.print();
  }
}
