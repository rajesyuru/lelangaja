document.getElementById('form-passreset-email').addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    $.ajax({
        url: '/reset-email',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            email: email
        }),
        dataType: 'json',
        success: function(json) {
            if (json.status === 'success') {
                location.href = '/reset-password';
            } else {
                document.getElementById('message-error').classList.remove('d-none');
                document.querySelector('#message-error .message').innerText = json.message;
            }
        }
    });
});