import { LitElement, css, html } from "lit";
import { TWStyles } from "../css/tw";
import { GeneralUtil } from "../utils";
import { CheckoutAPI } from "../services/checkout";
import QRCode from 'qrcode';

export class TCheckout extends LitElement {
  static get properties() {
    return {
      cart: {},
      products: {},
      cartItems: {},
      totalAmount: {},
      btcPrice: {},
      btcAmount: {},
      address: {},
      clock: { state: true },
      copied: { state: true },
      status: { state: true },
      paymentInfo: { state: true },
      isPaid: { state: true },
    }
  }

  static get styles() {
    return [TWStyles]
  }

  constructor() {
    super();
    this.checkoutAPI = new CheckoutAPI();
    this.btcPrice = 0.00;
    this.btcAmount = 0.00;
    this.address = "";
    this.totalTime = 599;
    this.clock = this.totalTime;
    this.copied = false;
    this.status = 0;
    this.paymentInfo = {
      value: 0,
      timestamp: 0,
      txid: "",
    };
    this.blockonomicsAPIBaseUrl = import.meta.env.VITE_BLOCKONOMICS_MAIN_URL;
    this.isPaid = false;
    this.socket = undefined;
  }

  async connectedCallback() {
    super.connectedCallback();
    this._startTimer();
    await this.computeBTCAmount();
    await this.getAddress()
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.closeSocketConnection();
    clearInterval(this.timer);
  }

  get statusText() {
    return this.getStatusText(this.status);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('cart')) {
      this.computeCartItems();
    }

    if ((changedProperties.has('address') || changedProperties.has('btcAmount')) &&
      (this.address && this.btcAmount))
    {
      this.generateQRCode(this.address, this.btcAmount)
    }

    if (changedProperties.has('address') && this.address) {
      this.setupWebsocket()
    }
  }

  paymentConfirmed(paymentInfo) {
    return html`
      <div class="flex flex-col items-center">
        <div class="mb-4">
          ${paymentInfo.status === 1 ? html`
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          ` : ``}
          ${paymentInfo.status === 2 ? html`
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ` : ``}

        </div>
        <p class="text-base text-center">
          Payment Status : <span class="font-semibold">${this.statusText}</span>
        </p>
        <div class="p-4 bg-gray-100 my-6 w-full">
          <div class="mt-6">
            <h5 class="font-semibold mb-2">Payment Details</h5>
            <div class="flex justify-between py-2">
              <div class="basis-[50%]">
                <p>Amount to pay</p>
              </div>
              <div class="basis-[50%] text-right">
                ${this.btcAmount} BTC
              </div>
            </div>
            <div class="flex justify-between py-2">
              <div class="basis-[50%]">
                <p>Amount paid</p>
              </div>
              <div class="basis-[50%] text-right">
                ${GeneralUtil.satsToBtc(paymentInfo.value)} BTC
              </div>
            </div>
            <div class="flex justify-between py-2">
              <div class="basis-[50%]">
                <p>Amount outstanding</p>
              </div>
              <div class="basis-[50%] text-right">
                ${(this.btcAmount - GeneralUtil.satsToBtc(paymentInfo.value)).toFixed(8)} BTC
              </div>
            </div>
            <div class="flex justify-between py-2">
              <div class="basis-[50%]">
                <p>Date and Time</p>
              </div>
              <div class="basis-[50%] text-right">
                ${GeneralUtil.timestampToHumanReadable(paymentInfo.timestamp)}
              </div>
            </div>
            <div class="flex justify-between py-2">
              <div class="basis-[50%]">
                <p>Link to Transaction</p>
              </div>
              <div class="basis-[50%] text-right">
                <a
                  class="underline"
                  href="${this.blockonomicsAPIBaseUrl}/#/search?q=${paymentInfo.txid}" 
                  target="_blank"
                >
                  ${paymentInfo.txid.substring(0,15)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  render() {
    const minutes = Math.floor(this.clock / 60);
    const seconds = this.clock % 60;
    return html`
      <div class="absolute top-[10%] left-[50%] translate-y-[-10%] translate-x-[-50%]">
        <div class="w-[600px] max-h-[400px] overflow-y-auto shadow-xl z-10 p-8 bg-white border border-black">
          <div class="flex justify-between mb-5">
            ${this.status === 0 ? html`
              <h2 class="text-3xl">Checkout Page</h2>
            ` : html`<div></div>`}
            <button class="underline" @click="${this.closeCheckout}">Close</button>
          </div>

          <!-- Show Payment Confirmation after Websocket message received -->
          ${this.status > 0 ? html`
            ${this.paymentConfirmed(this.paymentInfo)}
          ` : html`
            <div>
              <div class="flex items-stretch gap-2">
                <div id="btc-div"></div>
                <div class="w-full">
                  <div class="p-4 bg-gray-100 mb-6">
                    <p class="text-base mb-1">Amount to pay in USD</p>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h4 class="text-[18px] font-medium">${this.totalAmount} USD</h4>
                      </div>
                    </div>
                  </div>
                  <div class="p-4 bg-gray-100 mb-6">
                    <p class="text-base mb-1">Amount to pay in BTC</p>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                        <h4 class="text-[18px] font-medium">${this.btcAmount} BTC</h4>
                      </div>
                      <button class="p-2 rounded-md hover:scale-[1.1] border"
                        @click="${() => this.copy(this.btcAmount, 'BTC Amount')}"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-4 bg-gray-100 mb-6">
                <p class="text-base mb-1">Pay to the address</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                      stroke-width="1.5"    stroke="currentColor" class="size-8"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                    </svg>
                    <h4 class="text-[18px] font-medium">${this.address}</h4>
                  </div>
                  <button class="p-2 rounded-md hover:scale-[1.1] border"
                    @click="${() => this.copy(this.address, 'BTC Address')}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="p-4 bg-gray-100 mb-6">
                <p class="text-base mb-1">Payment Status</p>
                <div class="flex items-center gap-5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                  <h4 class="text-[18px] font-medium">${this.statusText}</h4>
                </div>
              </div>
            </div>
          `}
        </div>
        ${this.status === 0 ? html`
          <div class="bg-black text-white w-full absolute h-[25px] bottom-0 border border-black">
            <p class="text-base text-center">${minutes}:${seconds} left to pay your order</p>
          </div>
        ` : ``}
      </div>
    `
  }

  closeCheckout = () => {
    const event = new CustomEvent('close-checkout', {
      detail: {
        is_paid: this.isPaid
      }
    });
    this.dispatchEvent(event);
  }

  computeCartItems = () => {
    const { totalAmount, cartItems } = GeneralUtil.computeCartItems(this.cart, this.products);
    this.totalAmount = totalAmount;
    this.cartItems = cartItems;
  }

  computeBTCAmount = async () => {
    try {
      const { price: btcPrice } = await this.checkoutAPI.getBTCPrice();
      this.btcPrice = btcPrice
      this.btcAmount = (parseFloat(this.totalAmount) / parseFloat(btcPrice)).toFixed(8);
    } catch (error) {
      console.error('Error while computing BTC amount ', error)
      throw error;
    }
  }

  getAddress = async () => {
    try {
      const response = await this.checkoutAPI.getAddress();
      this.address = response.address;
    } catch (error) {
      console.error('Error while computing BTC amount ', error)
      throw error;
    }
  }

  generateQRCode = (address, amount) => {
    const bitcoinUri = `bitcoin:${address}?amount=${amount}`;
    const btcDiv = this.shadowRoot.getElementById('btc-div')
    QRCode.toCanvas(bitcoinUri, { errorCorrectionLevel: 'H' }, function (err, canvas) {
      if (err) throw err;
      
      document.body.appendChild(canvas);
      btcDiv.appendChild(canvas);
    });
  }

  _startTimer = () => {
    const interval = 1000;
    this.timer = setInterval(() => this._tick(), interval);
  }

  _tick() {
    this.clock -= 1;

    if (this.clock <= 0) {
      this._resetTimer();
    }
  }

  _resetTimer = async () => {
    clearInterval(this.timer);
    this.clock = this.totalTime;
    await this.computeBTCAmount()
    this._startTimer();
  }

  copy = async (value, title) => {
    this.copied = true;
    await navigator.clipboard.writeText(value);
    setTimeout(() => {
      this.copied = false;
    }, 2000)
    alert(`${title} has been copied`)
  }

  setupWebsocket = () => {
    const baseUrl = import.meta.env.VITE_BLOCKONOMICS_WEBSOCKET_BASE_URI
    const websocketUri = `${baseUrl}/${this.address}`;
    let socket;
    const _this = this;

    const connect = () => {
      this.socket = new WebSocket(websocketUri);

      console.log('Attempting WebSocket connection...');

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.socket.onmessage = (event) => {
        console.log('WebSocket message received');
        const response = JSON.parse(event.data);
        _this.status = response.status;
        _this.paymentInfo = response;
        if (response.status > 0) {
          _this.isPaid = true;
        }
        _this.requestUpdate();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
      };
    };

    connect();
  };


  getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Unconfirmed";
      case 1:
        return "Partially Confirmed";
      case 2:
        return "Confirmed";
      default:
        return "Unconfirmed";
    }
  }

  closeSocketConnection = () => {
    this.socket.close();
  }
}

customElements.define('t-checkout', TCheckout)