document.addEventListener('DOMContentLoaded', function() {
  const pageDataElement = document.getElementById('pageData');
  let currentPage = parseInt(pageDataElement.getAttribute('data-current-page'));
  const totalPages = parseInt(pageDataElement.getAttribute('data-total-pages'));
  const catname = pageDataElement.getAttribute('data-catname');

  async function changePage(page) {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      currentPage = page;
      await fetchProducts(page);
      updatePagination();
    }
  }

  async function fetchProducts(page) {
    try {
      const response = await fetch(`/cat/${catname}?page=${page}&ajax=true`); // ⬅ Додаємо `ajax=true`
      if (response.ok) {
        const data = await response.text(); 
        document.querySelector("#product-list").innerHTML = data; // ⬅ Міняємо `innerHTML` тільки для продуктів
      } else {
        console.error('Ошибка при получении данных с сервера');
      }
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
    }
  }

  function updatePagination() {
    document.querySelectorAll('.page-btn').forEach(button => {
      const page = parseInt(button.getAttribute('data-page'));
      button.classList.toggle('active', page === currentPage);
    });
  }

  document.querySelectorAll('.page-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // ⬅ Запобігаємо переходу за посиланням
      const page = parseInt(e.target.getAttribute('data-page'));
      changePage(page);
    });
  });
});