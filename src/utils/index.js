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

const satsToBtc = (sats) => {
  return sats / 1.0E8
}

const timestampToHumanReadable = (timestamp, commaSeperator = true) => {
  const date = new Date(timestamp * 1000); // convert to milliseconds
    let dateString = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

    if (!commaSeperator) {
      dateString = dateString.replace(',', '');
    }

    return dateString;
  }

export const GeneralUtil = {
  computeCartItems,
  satsToBtc,
  timestampToHumanReadable,
}