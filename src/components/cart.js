import { LitElement, html, css } from "lit";
import { TWStyles } from "../css/tw";

export class TCart extends LitElement {
  static get properties() {
    return {
      cart: {},
      products: {},
      cartItems: { state: true }
    }
  }

  static get styles() {
    return [
      css``,
      TWStyles
    ]
  }

  constructor() {
    super();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('cart')) {
      this.computeCartItems()
    }
  }

  render() {
    return html`
      <div class="absolute top-[10%] left-[50%] translate-y-[-10%] translate-x-[-50%]">
        <div class="w-[600px] max-h-[400px] overflow-y-auto shadow-xl z-10 p-4 py-8 bg-white border border-black">
          <div class="flex justify-between mb-5">
            <h2 class="text-3xl">Cart</h2>
            <button @click="${this.closeCart}">Close</button>
          </div>
          <div class="flex items-center font-bold">
            <div class="basis-[50%]">
              <h4>PRODUCT</h4>
            </div>
            <div class="basis-[25%] text-center">
              <h4>QUANTITY</h4>
            </div>
            <div class="basis-[25%] text-right">
              <h4>AMOUNT</h4>
            </div>
          </div>
          ${this.cartItems.map((item) => html`
            <div class="flex items-center py-5 font-semibold text-base overflow-y-scroll">
              <div class="basis-[50%] flex items-center gap-3">
                <img src="${item.image}" width="40"/>
                <p>${item.title}</p>
              </div>
              <div class="basis-[25%] text-center">
                <p>${item.quantity}</p>
              </div>
              <div class="basis-[25%] text-right">
                <p>${parseFloat(item.price) * parseFloat(item.quantity)} USD</p>
              </div>
            </div>
          `)}
        </div>
      </div>
    `
  }

  closeCart = () => {
    const event = new CustomEvent('close-cart');
    this.dispatchEvent(event);
  }

  computeCartItems = () => {
    const _cart = this.cart;
    const computedArr = []
    for (const key in _cart) {
      if (!_cart[key]) continue
      
      const value = _cart[key];
      const product = this.products.filter((product) => product.id == key)[0];
      computedArr.push({
        ...product,
        quantity: value
      })
    }
    this.cartItems = computedArr;
    console.log('cart Items =>', this.cartItems);
  }
}

customElements.define('t-cart', TCart);