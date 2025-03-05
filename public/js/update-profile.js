document.querySelector('.update-profile-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch("/account/update-profile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Профіль успішно оновлений!');
            window.location.href = "/account"; 
        } else {
            alert('Сталася помилка при оновленні профілю');
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Помилка при оновленні профілю');
    }
});