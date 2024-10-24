document.addEventListener('DOMContentLoaded', function () {
    // Fetch products and populate the dropdown
    function fetchProducts() {
        fetch('https://oilgas.pythonanywhere.com/pos/other_products') // Adjust this URL according to your API endpoint
            .then(response => response.json())
            .then(data => {
                const productSelect = document.getElementById('productSelect');
                productSelect.innerHTML = '<option value="">Select a product</option>'; // Add default option

                if (Array.isArray(data)) {
                    data.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.dataset.price = product.price;
                        option.textContent = product.name;
                        productSelect.appendChild(option);
                    });
                    // Refresh the selectpicker after adding new options
                    $(productSelect).selectpicker('refresh');
                } else {
                    console.error('Received data is not an array:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    fetchProducts();

    // Calculate total price based on selected product and quantity
    const quantityInput = document.getElementById('quantityInput');
    const totalPriceInput = document.getElementById('totalPrice');

    quantityInput.addEventListener('input', function () {
        const selectedOption = document.querySelector('#productSelect option:checked');
        const price = parseFloat(selectedOption.dataset.price) || 0;
        const quantity = parseInt(quantityInput.value) || 0;

        const totalPrice = price * quantity;
        totalPriceInput.value = totalPrice; // Set the total price
    });

    // Calculate quantity based on total price
    totalPriceInput.addEventListener('input', function () {
        const selectedOption = document.querySelector('#productSelect option:checked');
        const price = parseFloat(selectedOption.dataset.price) || 0;
        const totalPrice = parseFloat(totalPriceInput.value) || 0;

        const quantity = price > 0 ? (totalPrice / price) : 0; // Calculate quantity
        quantityInput.value = quantity.toFixed(2); // Set the quantity input
    });

    // Handle form submission
    const saleForm = document.getElementById('saleForm');
    const submitButton = saleForm.querySelector('button[type="submit"]');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Adding sale...';
    loadingIndicator.style.display = 'none'; // Initially hidden
    saleForm.appendChild(loadingIndicator); // Append loading indicator to the form

    saleForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Show loading indicator and disable submit button
        submitButton.disabled = true;
        loadingIndicator.style.display = 'block';

        // Get worker ID from local storage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const workerId = userInfo ? userInfo.id : undefined;

        const formData = {
            customer: saleForm.querySelector('input[placeholder="Enter Customer Name"]').value,
            phone: saleForm.querySelector('input[placeholder="Enter Customer Phone"]').value,
            product: saleForm.querySelector('#productSelect').value,
            amount_bought: quantityInput.value, // Use quantityInput value here
            amount_paid: totalPriceInput.value,
            payment_option: saleForm.querySelector('select[name="payment_option"]').value,
            worker_id: workerId // Include the worker ID
        };

        fetch('https://oilgas.pythonanywhere.com/pos/add_sales', { // Adjust this URL according to your API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || 'An unexpected error occurred.');
                    });
                }
                return response.json();
            })
            .then(() => {
                alert('Sale added successfully!');
                // Optionally reset the form
                saleForm.reset();
                totalPriceInput.value = '';
                $(saleForm.querySelector('#productSelect')).selectpicker('refresh');
                window.location.href = 'index.html'; 
            })
            .catch(error => {
                alert('Error adding sale: ' + error.message);
            })
            .finally(() => {
                // Hide loading indicator and enable submit button after process finishes
                loadingIndicator.style.display = 'none';
                submitButton.disabled = false;
            });
    });
});
