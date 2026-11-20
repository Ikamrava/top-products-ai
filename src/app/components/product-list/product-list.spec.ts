import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates links to Amazon UK', () => {
    expect(component.getAmazonUrl('desk lamp')).toBe(
      'https://www.amazon.co.uk/s?k=desk%20lamp&tag=your-store-tag-20'
    );
  });

  it('shows the Amazon price or an unavailable label for each product', () => {
    fixture.componentRef.setInput('products', [
      {
        name: 'Desk lamp',
        award: 'Best budget',
        description: 'A practical lamp.',
        pros: [],
        cons: [],
        imageUrl: '',
        price: '£24.99',
        rating: 4.7,
        ratingCount: 123,
        snippet: 'Dimmable desk lamp with adjustable brightness.',
        amazonUrl: 'https://www.amazon.co.uk/dp/example',
      },
      {
        name: 'Reading lamp',
        award: 'Best overall',
        description: 'A flexible lamp.',
        pros: [],
        cons: [],
        imageUrl: '',
        price: null,
      },
    ]);
    fixture.detectChanges();

    const prices = fixture.nativeElement.querySelectorAll('.product-price');
    expect(prices[0].textContent).toContain('£24.99');
    expect(prices[1].textContent).toContain('Unavailable');
    expect(fixture.nativeElement.querySelector('.product-rating').textContent).toContain('4.7');
    expect(fixture.nativeElement.querySelector('.amazon-snippet').textContent).toContain(
      'Dimmable desk lamp'
    );
    expect(fixture.nativeElement.querySelector('a').href).toBe('https://www.amazon.co.uk/dp/example');
  });
});
