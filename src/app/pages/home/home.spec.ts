import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AiService } from '../../services/ai.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const aiService = {
    getTopProducts: vi.fn<AiService['getTopProducts']>(),
  };

  beforeEach(async () => {
    aiService.getTopProducts.mockReset();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: AiService, useValue: aiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a no-new-products message for an empty Amazon result', async () => {
    aiService.getTopProducts.mockResolvedValue([]);
    await component.handleSearch('rare item');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Amazon UK didn't find new products"
    );
  });

  it('shows the backend stage error when product generation fails', async () => {
    aiService.getTopProducts.mockRejectedValue(new Error('AI product summaries failed.'));
    await component.handleSearch('apple mobile phones');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'AI product summaries failed.'
    );
  });

  it('shows a loading state and scrolls to the first result when the guide is ready', async () => {
    let finishRequest!: (products: unknown[]) => void;
    aiService.getTopProducts.mockReturnValue(
      new Promise((resolve) => {
        finishRequest = resolve;
      })
    );
    const scrollIntoView = vi.fn();
    const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      fixture.detectChanges();
      const searchPromise = component.handleSearch('desk lamps');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(input.disabled).toBe(true);
      expect(button.disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();

      finishRequest([
        {
          name: 'Desk lamp',
          award: 'Best overall',
          description: 'A practical desk lamp.',
          pros: ['Adjustable'],
          cons: ['No smart features'],
        },
      ]);
      await searchPromise;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(input.disabled).toBe(false);
      expect(button.disabled).toBe(false);
      expect(fixture.nativeElement.querySelector('#first-product')).toBeTruthy();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    } finally {
      if (scrollDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
      }
    }
  });
});
