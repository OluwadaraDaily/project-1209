import { AES, enc } from "crypto-js";

const secretKey = import.meta.env.VITE_LOCAL_STORAGE_ENCRYPTION_KEY;

const encryptData = (data, key = secretKey) => {
    return AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (ciphertext, key = secretKey) => {
    const bytes = AES.decrypt(ciphertext, key);
    return JSON.parse(bytes.toString(enc.Utf8));
};

const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? decryptData(cart) : null
}

const saveCart = (cart = {}) => {
  const encryptedCart = encryptData(cart);
  localStorage.setItem('cart', encryptedCart)
}


export const CartUtil = {
  getCart,
  saveCart
}


