import { LitElement, html } from "lit";
import { TWStyles } from "../css/tw";

export class TModal extends LitElement {
  static get styles() {
    return [TWStyles]
  }
  
  render() {
    return html`
      <div class="absolute top-[10%] left-[50%] translate-y-[-10%] translate-x-[-50%]">
        <div class="w-[600px] max-h-[400px] overflow-y-auto shadow-xl z-10 p-8 bg-white border border-black">
          <slot name="body"></slot>
        </div>
      </div>
    `
  }
}

customElements.define('t-modal', TModal)