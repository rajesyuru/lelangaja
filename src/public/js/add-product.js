document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const image = document.getElementById('image').value;
    const description = document.getElementById('description').value;
    const multiplier = document.getElementById('multiplier').value;
    const end_date = document.getElementById('end_date').value;

    fetch('/api/add-product', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                image: image,
                description: description,
                multiplier: multiplier,
                end_date: end_date,
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
});