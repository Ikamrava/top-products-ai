import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('propagates backend errors instead of treating them as empty results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ error: 'AI product summaries failed. Please try again.' }),
      })
    );

    await expect(service.getTopProducts('apple mobile phones')).rejects.toThrow(
      'AI product summaries failed. Please try again.'
    );
  });

  it('encodes the query and returns an empty result list unchanged', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.getTopProducts('desk lamps based on price')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/get-products?category=desk%20lamps%20based%20on%20price'
    );
  });
});
