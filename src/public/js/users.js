fetch('/api/users')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const tbody = document.querySelector('table#tableUsers tbody');

            data.data.forEach(user => {
                tbody.innerHTML += `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${btoa(user.password)}</td>
                    </tr>
                `;
            });
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.log(error));