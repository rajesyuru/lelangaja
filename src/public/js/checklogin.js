fetch('/check-login')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'error') {
            location.href = 'index.html';
        } else {
            document.getElementById('userName').innerText = `Halo ${data.user.name}`;

            const event = new CustomEvent('user-ready', {
                bubbles: true,
                detail: {
                    user: data.user,
                },
            });

            document.dispatchEvent(event);
        }
    })
    .catch(error => console.log(error));