document.querySelector('.button-add-to-cart').addEventListener('click', async function (){
     const goodsId = this.dataset.id;
     const messageBox = this.nextElementSibling; 
     console.log(goodsId);

     let response = await fetch('/cart/add-to-cart', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({'id' : goodsId})
     })

     if (response.ok) {
      messageBox.textContent = 'Страва додана до кошика!';
      messageBox.style.display = 'inline';

      setTimeout(() => {
          messageBox.style.display = 'none';
      }, 3000);
   }
     getOrder();
});

