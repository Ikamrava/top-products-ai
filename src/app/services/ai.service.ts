import { Service } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

@Service()
export class AiService {
  async getTopProducts(category: string) {
    try {
      // Point Angular to your new secure serverless backend
      const response = await fetch(`/api/get-products?category=${category}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from backend:', error);
      return [];
    }
  }
}
