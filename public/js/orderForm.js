// document.addEventListener("DOMContentLoaded", function () {
//     const orderButton = document.getElementById("order-button");
//     const orderForm = document.getElementById("order-form");
//     const cart = JSON.stringify(cart) ;
//     const cancelButton = document.getElementById("cancel-button");

//     const cartMessage = document.getElementById("cart-message");
//     if (Object.keys(cart).length === 0) {
//         cartMessage.textContent = "Товарів немає в кошику. Додайте товари для замовлення.";
//         cartMessage.style.color = "red"; 
//     } else {
//         orderButton.addEventListener("click", function () {
//             orderForm.style.display = "block";
//             orderButton.style.display = "none"; 
//         });
    
//         cancelButton.addEventListener("click", function () {
//             orderForm.style.display = "none";
//             orderButton.style.display = "inline-block"; 
//         });
//     }
// });


document.addEventListener("DOMContentLoaded", function () {
    const orderButton = document.getElementById("order-button");
    const orderForm = document.getElementById("order-form");
    const cancelButton = document.getElementById("cancel-button");

    const cartMessage = document.getElementById("cart-message");

    const cart = {}; 

    // Перевірка, чи кошик порожній
    if (Object.keys(cart).length === 0) {
        cartMessage.textContent = "Товарів немає в кошику. Додайте товари для замовлення.";
        cartMessage.style.color = "red"; 
        orderButton.style.display = "none"; 
    } else {
        cartMessage.textContent = ""; 
        orderButton.style.display = "inline-block"; 

        orderButton.addEventListener("click", function () {
            orderForm.style.display = "block";
            orderButton.style.display = "none"; 
        });

        cancelButton.addEventListener("click", function () {
            orderForm.style.display = "none";
            orderButton.style.display = "inline-block"; 
        });
    }
});
