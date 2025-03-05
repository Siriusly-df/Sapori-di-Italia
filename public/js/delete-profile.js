document.addEventListener("DOMContentLoaded", function () {
    const deleteButton = document.querySelector('.btn-delete-profile');

    deleteButton.addEventListener('click', function () {
        deleteProfile();
    });

    function deleteProfile() {
        fetch('/account/delete-profile-db', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                window.location.href = `/cat`;
            } else {
                alert('Не вдалося видалити профіль');
            }
        })
        .catch(error => {
            console.error('Помилка:', error);
            alert('Щось пішло не так');
        });
    }
});