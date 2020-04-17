var unsaved = false;

$(":input").change(function(){ //triggers change in all input fields including text type
    unsaved = true;
});

function unloadPage(){ 
    if(unsaved){
        return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
    }
}

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

window.onbeforeunload = unloadPage;