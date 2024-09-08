import { Http } from "../utils/http"

export class CheckoutAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_BLOCKONOMICS_API_URL
  }

  async getBTCPrice(currencyCode = 'USD') {
    try {
      const response = await Http.get(`${this.baseURL}/price?currency_code=${currencyCode}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAddress() {
    try {
      const response = await Http.post(`${this.baseURL}/new_address`);
      return response;
    } catch (error) {
      throw error;
    }
  }

}