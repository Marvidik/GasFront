document.addEventListener('DOMContentLoaded', function() {
    // Fetch user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo) {
        const userId = userInfo.id;
        const username = userInfo.username;

        // Update the greeting with the user's name
        const greetingElement = document.querySelector('h3.mb-3');
        greetingElement.textContent = `Hi ${username}, Good Morning`;

        // Fetch worker stats using the user's ID
        fetch(`https://oilgas.pythonanywhere.com/pos/workers_stats_today/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch worker stats');
                }
                return response.json();
            })
            .then(data => {
                console.log('Worker Stats:', data);

                // Display total sales in the appropriate place
                document.getElementById('tot-sales').textContent = data.total_sales + "kg";

                // Display total money made in the appropriate place
                document.getElementById('tot-money').textContent = "₦" + data.total_money_made;
                document.getElementById('ave').textContent = userId;
            })
            .catch(error => {
                console.error('Error fetching worker stats:', error);
            });

        // Fetch worker sales data to display in the table
        fetch(`https://oilgas.pythonanywhere.com/pos/worker_sales/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch worker sales');
                }
                return response.json();
            })
            .then(salesData => {
                console.log('Worker Sales:', salesData);

                // Get the tbody where the data should be inserted
                const tableBody = document.querySelector('tbody.ligth-body');
                
                // Clear existing rows
                tableBody.innerHTML = '';

                // Iterate over worker_sales array and create table rows
                salesData.worker_sales.forEach(sale => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>
                            <div class="checkbox d-inline-block">
                                <input type="checkbox" class="checkbox-input">
                                <label class="mb-0"></label>
                            </div>
                        </td>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.customer}</td>
                        <td>₦${sale.amount_paid}</td>
                        <td>${sale.payment_option}</td>
                        
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching worker sales:', error);
            });
    } else {
        console.error('No user information found in localStorage');
    }
});
