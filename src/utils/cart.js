import { AES, enc } from "crypto-js";

const secretKey = import.meta.env.VITE_LOCAL_STORAGE_ENCRYPTION_KEY;

const encryptData = (data) => {
    return AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (ciphertext) => {
  const bytes = AES.decrypt(ciphertext, secretKey);
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


