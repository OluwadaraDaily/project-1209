import { LitElement, css, html } from 'lit'
import { StoreAPI } from '../services/store';
import { TWStyles } from '../css/tw';

export class TStore extends LitElement {
  static get properties() {
    return {
      products: {}
    }
  }

  constructor() {
    super();
    this.storeAPI = new StoreAPI();
    this.products = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchProducts();
  }

  render() {
    return html`
      <div class="relative min-h-[100vh] w-full border border-green-900">
        <h1>This is an empty store...</h1>
      </div>
    `
  }

  static get styles() {
    return [css`
      .text-red-500 {
        color: red;
      }
    `, TWStyles]
  }

  fetchProducts = async () => {
    try {
      const response = await this.storeAPI.fetchProducts(10);
      console.log('RESPONSE =>', response);
      this.products = response;
    } catch (error) {
      console.log('ERROR =>', error);
    }
  }
}

window.customElements.define('t-store', TStore)
