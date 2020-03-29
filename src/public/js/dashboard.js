fetch('/check-login')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'error') {
            location.href = 'index.html';
        }
    })
    .catch(error => console.log(error));