import { Http } from "../utils/http";

export class StoreAPI {
  constructor() {
    this.baseUrl = import.meta.env.VITE_BASE_URL; // Base URL should not include protocol
  }
  
  async fetchProducts(limit = null) {
    try {
      const baseURI = `/products`; // Only the path is required since the base URL is handled
      const URI = limit ? `${baseURI}?limit=${limit}` : baseURI;
      const response = await Http.get(`${this.baseUrl}${URI}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
