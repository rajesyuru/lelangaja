if (document.getElementById('delete-all-notifications') !== null) {
    document.getElementById('delete-all-notifications').addEventListener('click', () => {
        $.ajax({
            url: '/api/delete-all-notifications',
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
        // console.log('bruh')
    });
}

if (document.getElementById('read-all-button') !== null) {
    document.getElementById('read-all-button').addEventListener('click', () => {
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

