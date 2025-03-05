async function getOrder () {
     let response = await  fetch('/cart/get-cart');
     const result = await response.json()
     console.log(result);
     const goodsObj = result.products.reduce((accum, item )=> {
        accum[item.id] = item;
        return accum;
     }, {});
     console.log(goodsObj);
     showCart(result.cart, goodsObj)
};

async function removeFromCart(id) {
  const response = await fetch('/cart/remove-from-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (response.ok) {
    await getOrder(); 
  }
}

async function updateCart(id, quantity) {
  const response = await fetch('/cart/update-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, quantity }),
  });

  if (response.ok) {
    await getOrder(); 
  }
}

function showCart(cart, goodsObj) {
  let out = '';
  let total = 0;
  const tbody = document.querySelector('.cart-table tbody');

  if (!tbody) {
    console.log("tbody не знайдено");
    return;
  }

  for (const id in cart) {
    out += `<tr>
                <td><img src="/images/${goodsObj[id].image}" alt="${goodsObj[id].name}" width="50"></td>
                <td>${goodsObj[id].name}</td>
                <td>
                  <button class="updateCart-btn" onclick="updateCart(${id}, ${cart[id] - 1})">-</button>
                  x ${cart[id]}
                  <button class="updateCart-btn" onclick="updateCart(${id}, ${cart[id] + 1})">+</button>
                </td>
                <td>${goodsObj[id].price} грн</td>
                <td>${(cart[id] * Number(goodsObj[id].price)).toFixed(2)} грн</td>
                <td><button class="removeFromCart-btn" onclick="removeFromCart(${id})">Видалити</button></td>
            </tr>`;
    total += cart[id] * Number(goodsObj[id].price);
  }

  tbody.innerHTML = out;
  document.querySelector('#total-price').textContent = `${total.toFixed(2)} грн`;
}



 
getOrder();