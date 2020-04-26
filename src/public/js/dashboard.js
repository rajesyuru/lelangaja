// document.getElementById('notification-read').addEventListener('click', () => {
//     $.ajax({
//         url: '/read-all-notifications',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         dataType: 'json',
//         success: function(json) {
//             if (json.status === 'success') {
//                 location.href = '/notifications';
//             } else {
//                 alert('error');
//             }
//         }
//     });
// });