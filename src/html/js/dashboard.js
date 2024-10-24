document.addEventListener('DOMContentLoaded', function () {
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
                document.getElementById('tot-sales').textContent = data.date;

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
                        <td>
                            <div class="d-flex align-items-center list-action">
                                <a class="badge badge-info mr-2 view-receipt" data-id="${sale.id}" data-sale='${JSON.stringify(sale)}' data-toggle="tooltip" data-placement="top" title="View" href="pages-invoice.html"><i class="ri-eye-line mr-0"></i></a>
                                <a class="badge bg-success mr-2" data-toggle="tooltip" data-placement="top" title="Edit" href="#"><i class="ri-pencil-line mr-0"></i></a>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Add event listener to view-receipt buttons
                document.querySelectorAll('.view-receipt').forEach(button => {
                    button.addEventListener('click', function (event) {
                        event.preventDefault();

                        // Store sale data in localStorage
                        const saleData = this.getAttribute('data-sale');
                        localStorage.setItem('currentSale', saleData);

                        // Redirect to the invoice page
                        window.location.href = 'pages-invoice.html';
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching worker sales:', error);
            });
    } else {
        console.error('No user information found in localStorage');
    }
});
