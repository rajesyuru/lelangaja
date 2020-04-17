document.getElementById('form-passreset').addEventListener('submit', e => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    $.ajax({
        url: '/reset-password',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            password: password,
            password2: password2
        }),
        dataType: 'json',
        success: function(json) {
            if (json.status === 'success') {
                document.getElementById('message-success').classList.remove('d-none');
                document.getElementById('message-error').classList.add('d-none');
            } else {
                document.getElementById('message-success').classList.add('d-none');
                document.getElementById('message-error').classList.remove('d-none');
                document.querySelector('#message-error .message').innerText = json.message;
            }
        }
    });
});