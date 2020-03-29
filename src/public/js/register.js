document.getElementById('form-register').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    fetch('/register', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                password2: password2,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            if (json.status === 'success') {
                document.getElementById('message-success').classList.remove('d-none');
                document.getElementById('message-error').classList.add('d-none');
            } else {
                document.getElementById('message-success').classList.add('d-none');
                document.getElementById('message-error').classList.remove('d-none');
                document.querySelector('#message-error .message').innerText = json.message;
            }
        })
        .catch(error => console.log(error));
});