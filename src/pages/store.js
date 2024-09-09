import { LitElement, css, html } from 'lit'
import { StoreAPI } from '../services/store';
import { TWStyles } from '../css/tw';
import { TProduct } from '../components/product';
import { TCart } from '../components/cart';
import { CartUtil } from '../utils/cart';
import { TCheckout } from '../components/checkout';
import { PRODUCTS } from '../constants/product';

export class TStore extends LitElement {
  static get properties() {
    return {
      products: {},
      cart: { state: true },
      showCart: { state: true },
      showCheckout: { state: true },
      isCartEmpty: { state: true },
    }
  }

  constructor() {
    super();
    this.storeAPI = new StoreAPI();
    this.products = [];
    this.showCart = false;
    this.showCheckout = false;
  }

  async connectedCallback() {
    super.connectedCallback();
    // await this.fetchProducts();
    this.products = PRODUCTS;
    this.getCart();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('cart')) {
      CartUtil.saveCart(this.cart)
      this.computeCartStatus();
    }

    if (changedProperties.has('showCart') || changedProperties.has('showCheckout')) {
      this.toggleScrollLock();
    }
  }

  getCart = () => {
    let cart = CartUtil.getCart();
    if (!cart) {
      CartUtil.saveCart();
    }
    cart = CartUtil.getCart();
    this.cart = cart;
  }

  updateCart = (event) => {
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

  clearCart = () => {
    this.cart = {}
  }

  computeCartStatus = () => {
    this.isCartEmpty = Object.keys(this.cart).length === 0 || 
                      Object.values(this.cart).every(item => item === 0);
  }

  openCart = () => {
    console.log('DOCUMENT =>', document)
    console.log('HTML =>', document.html)
    this.showCheckout = false;
    this.showCart = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  openCheckout = () => {
    this.showCart = false;
    this.showCheckout = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  toggleScrollLock = () => {
    const body = document.querySelector('body');
    console.log('BODY =>', body)
    if (this.showCart || this.showCheckout) {
      console.log('Prevent scrolling....')
      body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      body.style.overflow = ''; // Restore scrolling
    }
  }

  render() {
    return html`
      <div class="w-full h-full">
        ${this.showCart || this.showCheckout ? html`
          <div class="absolute bg-black bg-opacity-30 w-full h-full"></div>
        ` : ``}
        <div class="relative min-h-[100vh] w-full max-w-[1200px] md:w-[80%] mx-auto py-8">
          <div>
            <div class="flex md:flex-row flex-col items-center gap-8 justify-center mb-8">
              <div class="md:basis-[90%]">
                <h1 class="font-semibold text-center text-2xl">ALL PRODUCTS</h1>
              </div>
              <div class="basis-[10%] flex items-end gap-4">
                <button 
                  class="border border-black rounded-md px-4 py-1 hover:scale-[1.1] transition duration-150 ease-out hover:ease-in"
                  @click="${this.openCart}"
                >
                  Cart
                </button>
                <button 
                  class="underline disabled:opacity-50 disabled:cursor-not-allowed"
                  .disabled="${this.isCartEmpty}"
                  @click="${this.openCheckout}"
                >
                  Checkout
                </button>
              </div>
            </div>
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
          ${this.showCart ? html`
            <t-cart
              .cart="${this.cart}"
              .products="${this.products}"
              @close-cart="${this.closeCart}"
              @open-checkout="${this.openCheckout}"
            ></t-cart>
          ` : ``}
          ${this.showCheckout ? html`
            <t-checkout
              .cart="${this.cart}"
              .products="${this.products}"
              @close-checkout="${this.closeCheckout}"
            ></t-checkout>
          ` : ``}
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

  closeCart = () => {
    this.showCart = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  closeCheckout = (event) => {
    const isPaid = event.detail.is_paid
    this.showCheckout = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (isPaid) {
      this.clearCart();
    }
  }
}

window.customElements.define('t-store', TStore)
