document.getElementById('add-product-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const pathParts = window.location.pathname.split('/');
  const categoryParam = pathParts.find(part => part.includes('category='));
  const categoryId = categoryParam ? categoryParam.split('=')[1] : null;

  const formData = new FormData(this);
  const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')).toFixed(2),  
      weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
      ingredients: formData.get('ingredients'),
      image: formData.get('image'),
      categoryId: categoryId
  };

  console.log('Перевірені дані перед відправкою:', productData);

  try {
      const response = await fetch('/admin/add-product-db', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
      });

      if (response.ok) {
          alert('Продукт успішно додано');
          window.location.href = `/admin/cat`;
      } else {

          alert('Помилка при додаванні продукту');
      }
  } catch (error) {
      alert('Помилка сервера');
  }
});