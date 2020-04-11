$('#bid').on('click', function(e) {
    e.preventDefault();

    let product_id = $(this).data('product-id');
    let bid_price = $(this).data('bid-price');

    $.ajax({
        url: '/api/bid',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            product_id: product_id,
            price: bid_price,
        }),
        dataType: 'json',
        success: function(json) {
            if (json.status === 'success') {
                location.reload();
            } else {
                alert(json.message);
            }
        }
    });
});
