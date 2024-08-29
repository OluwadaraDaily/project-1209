import { Http } from "../utils/http";

export class StoreAPI {
  constructor() {
    this.baseUrl = import.meta.env.VITE_BASE_URL
  }
  
  async fetchProducts(limit = null) {
    try {
      let baseURI = `${this.baseUrl}/products`
      const URI = limit ? `${baseURI}?limit=${limit}` : `${this.baseURI}`;
      const response = Http.get(URI);
      return response;
    } catch (error) {
      throw error;
    }
  }

}