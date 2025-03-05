document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll('.btn-delete-product');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const productId = button.dataset.productId; 
      const categoryId = button.dataset.categoryId;
      
      if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
        deleteProduct(productId, categoryId);
      }
    });
  });
});

function deleteProduct(productId, categoryId) {
  fetch('/admin/delete-product-db', {
    method: 'DELETE',
    body: JSON.stringify({
      productId: parseInt(productId, 10),  
      categoryId: parseInt(categoryId, 10), 
    }),
    headers: {
      'Content-Type': 'application/json', 
    },
  })
  .then(response => response.json())  
  .then(data => {
    if (data.success) {
      alert('Товар видалено');
      window.location.href = '/admin/cat';  
    } else {
      alert(data.message || 'Не вдалося видалити товар');
    }
  })
  .catch(error => {
    console.error('Помилка:', error);
    alert('Сталася помилка під час видалення товару');
  });
}