import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { groqCreate } = vi.hoisted(() => ({ groqCreate: vi.fn() }));

vi.mock('groq-sdk', () => ({
  default: class Groq {
    chat = { completions: { create: groqCreate } };
  },
}));

import handler from './get-products.js';

describe('get-products handler', () => {
  beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', 'test-groq-key');
    vi.stubEnv('RAINFOREST_API_KEY', 'test-rainforest-key');
    groqCreate.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('cleans the request with AI, searches once, and preserves Amazon ratings', async () => {
    groqCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ search_term: 'Apple mobile phones' }) } }],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                products: [
                  {
                    index: 0,
                    award: 'Best pick',
                    description: 'A popular phone.',
                    pros: ['Well rated'],
                    cons: ['No details provided'],
                  },
                ],
              }),
            },
          },
        ],
      });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request_info: { success: true },
        search_results: [
          {
            title: 'Apple iPhone',
            image: 'https://example.com/image.jpg',
            link: 'https://www.amazon.co.uk/dp/example',
            rating: 4.7,
            ratings_total: 123,
            price: { value: 699, currency: 'GBP' },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = createResponse();
    await handler({ query: { category: 'Apple phones, cheapest' } }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({ rating: 4.7, ratingCount: 123 });
    expect(groqCreate).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const searchUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(searchUrl.searchParams.get('search_term')).toBe('Apple mobile phones');
    expect(searchUrl.searchParams.get('sort_by')).toBe('price_low_to_high');
  });

  it('returns an actionable error when Rainforest responds with HTTP 402', async () => {
    groqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ search_term: 'desk lamps' }) } }],
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 402 }));

    const response = createResponse();
    await handler({ query: { category: 'desk lamps' } }, response);

    expect(response.statusCode).toBe(502);
    expect(response.body.error).toContain('credits or billing attention');
  });
});

function createResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
