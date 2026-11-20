import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList {
  products = input<any[]>([]);
  save = output<any>();

  getAmazonUrl(productName: string): string {
    const myAffiliateTag = 'your-store-tag-20';
    return `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&tag=${myAffiliateTag}`;
  }

  // Automatically generates a custom image based on the product name!
  getImageUrl(productName: string): string {
    // We encode the product name so it safely fits in a URL
    const safeText = encodeURIComponent(productName);

    // This generates a clean 800x400 placeholder image with the product name written on it
    return `https://placehold.co/800x400/eeeeee/333333?text=${safeText}`;
  }

  printToPdf() {
    window.print();
  }
}
