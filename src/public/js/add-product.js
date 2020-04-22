$('[name="end_date"]').datetimepicker({
    format: 'Y-m-d H:i:00'
});

$('[name="multiplier"]').maskMoney({
    thousands: '.',
    precision: 0,
    bringCaretAtEndOnFocus: false,
});

$('#description:input').keyup(function(){
    $('#max-string-count').text(255 - (document.getElementById('description').value.length))
});

document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const image = document.getElementById('image').value;
    const description = document.getElementById('description').value;
    const multiplier = document.getElementById('multiplier').value.split('.').join('');
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