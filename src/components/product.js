import { LitElement, html, css } from "lit";
import { TWStyles } from "../css/tw";

export class TProduct extends LitElement {
  static properties = {
    product: {},
    quantity: {},
    cart: {}
  }

  static get styles() {
    return [css``, TWStyles]
  }

  constructor() {
    super();
    this.quantity = 0;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('cart')) {
      this.setQuantity();
    }
  }

  render() {
    return html`
      <div class="p-4 py-8 shadow-lg rounded-lg h-full flex flex-col justify-between">
        <div>
          <div class="flex justify-center items-center h-[180px]">
            <div class="py-4 w-[80px]">
              <img src="${this.product.image}" class="object-contain" alt="${this.product.title} image" />
            </div>
          </div>
          <div class="w-[250px] mb-4">
            <p class="text-sm uppercase font-bold mb-4">${this.product.title}</p>
            <p class="font-bold text-sm">${this.product.price} USD</p>
          </div>
        </div>
        <div class="">
          ${this.quantity < 1 ? html`
            <div>
              <button 
                type="button" 
                class="w-full py-2 border border-black rounded-lg shadow-md"
                @click="${() => this.emitCartEvent(this.product.id, 'add-to-cart')}"
              >
                Add to cart
              </button>
            </div>
          ` : html`
          
            <div class="flex justify-center mt-4">
              <div class="flex items-center gap-8">
                <button 
                  type="button" 
                  class="w-[50px] py-2 border border-black rounded-lg shadow-md"
                  @click="${() => this.emitCartEvent(this.product.id, 'remove-from-cart')}"
                >
                  -
                </button>
                <p>${this.quantity}</p>
                <button 
                  type="button"
                  class="w-[50px] py-2 border border-black rounded-lg shadow-md"
                  @click="${() => this.emitCartEvent(this.product.id, 'add-to-cart')}"
                >
                  +
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `
  }

  setQuantity = () => {
    this.quantity = this.cart[this.product.id] || 0;
  }

  emitCartEvent = (productId, name) => {
    const _event = new CustomEvent(name, {
      detail: {
        id: productId
      }
    })
    this.dispatchEvent(_event)
  }
}

customElements.define('t-product', TProduct);