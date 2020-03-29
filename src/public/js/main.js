document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(json => {
        if (json.status === 'success') {
            location.href = 'dashboard.html';
        } else {
            document.getElementById('message-success').classList.add('d-none');
            document.getElementById('message-error').classList.remove('d-none');
            document.querySelector('#message-error .message').innerText = json.message;
        }
    })
    .catch(error => console.log(error));
});