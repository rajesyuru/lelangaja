if (document.getElementById('read-all') !== null) {
    document.getElementById('read-all').addEventListener('click', () => {
        $.ajax({
            url: '/api/read-all-notifications',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            success: function(json) {
                if (json.status === 'success') {
                    location.reload();
                } else {
                    alert('error');
                }
            }
        });
    });
}