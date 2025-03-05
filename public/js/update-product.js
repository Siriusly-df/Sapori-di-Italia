document.querySelector('.update-product-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    data.id = document.getElementById('id').value;

    try {
        const response = await fetch(`/admin/update-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Страва успішно оновлена!');
            window.location.href = `/admin/cat`; 
        } else {
            alert('Сталася помилка при оновленні страви');
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Помилка при оновленні страви');
    }
});