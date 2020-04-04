let orName = '';

document.addEventListener('user-ready', function(e) {
    document.getElementById('name').value = e.detail.user.name;
    orName = e.detail.user.name;
});



document.getElementById('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;

    if (orName !== name) {
        if (confirm('Are you sure you want to change your user name?')) {
            fetch('/edit-profile', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: name,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        location.reload();
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.log(error));
        } else {
            return;
        }
    } else {
        alert('No changes were made');
    }

});

