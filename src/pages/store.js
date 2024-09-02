import { LitElement, css, html } from 'lit'
import { StoreAPI } from '../services/store';
import { TWStyles } from '../css/tw';
import { TProduct } from '../components/product';

export class TStore extends LitElement {
  static get properties() {
    return {
      products: {},
      cart: { state: true },
    }
  }

  constructor() {
    super();
    this.storeAPI = new StoreAPI();
    this.products = [];
    this.cart = {};
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchProducts();
  }

  updateCart(event) {
    const productId = event.detail.id;

    if (event.type === 'add-to-cart') {
      this.cart = {
        ...this.cart,
        [productId]: (this.cart[productId] + 1) || 1
      };
    } else if (event.type === 'remove-from-cart') {
      if (!this.cart[productId]) return;
      else {
        this.cart = {
            ...this.cart,
            [productId]: this.cart[productId] - 1
        };
      }
    }
  }

  render() {
    return html`
      <div class="relative min-h-[100vh] w-full max-w-[1200px] md:w-[80%] mx-auto my-8">
        <div>
          <h1 class="font-semibold mb-8 text-center text-2xl">ALL PRODUCTS</h1>
          <div class="flex items-stretch justify-center gap-6 flex-wrap">
            ${this.products.map((product, index) => html`
              <t-product
                .product="${product}"
                .cart="${this.cart}"
                @add-to-cart="${this.updateCart}"
                @remove-from-cart="${this.updateCart}"
              ></t-product>
            `)}
          </div>
        </div>
      </div>
    `
  }

  static get styles() {
    return [css``, TWStyles]
  }

  fetchProducts = async () => {
    try {
      const response = await this.storeAPI.fetchProducts(10);
      this.products = response;
    } catch (error) {
      console.error('ERROR =>', error);
    }
  }
}

window.customElements.define('t-store', TStore)
