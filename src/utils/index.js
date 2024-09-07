const computeCartItems = (cart, products) => {
  const _cart = cart;
  const computedArr = []
  for (const key in _cart) {
    if (!_cart[key]) continue
    
    const value = _cart[key];
    const product = products.filter((product) => product.id == key)[0];
    computedArr.push({
      ...product,
      quantity: value,
      amount: parseInt(value) * product.price
    })
  }
  const totalAmount = Number(computedArr.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
  const cartItems = computedArr;

  return {
    totalAmount,
    cartItems
  }
}

export const GeneralUtil = {
  computeCartItems,
}