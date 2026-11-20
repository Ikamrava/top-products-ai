import { Service } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

@Service()
export class AiService {
  async getTopProducts(category: string) {
    const response = await fetch(`/api/get-products?category=${encodeURIComponent(category)}`);
    const data: unknown = await response.json();

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
          ? data.error
          : `Product search failed with HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!Array.isArray(data)) {
      throw new Error('Product search returned an invalid response.');
    }

    return data;
  }
}
