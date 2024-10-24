document.addEventListener('DOMContentLoaded', function () {
    const saleForm = document.getElementById('saleForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    let pricePerKg = 0; 
    const PRICE_API_URL = 'https://oilgas.pythonanywhere.com/pos/price';
    const PRICE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

    // Fetch price from the server
    function fetchPrice() {
        fetch(PRICE_API_URL)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch price'))
            .then(data => {
                const fetchedPrice = data.price;
                const cachedPrice = localStorage.getItem('pricePerKg');

                if (cachedPrice !== fetchedPrice.toString()) {
                    localStorage.setItem('pricePerKg', fetchedPrice);
                    pricePerKg = fetchedPrice;
                    console.log('Price updated:', pricePerKg);
                } else {
                    pricePerKg = parseFloat(cachedPrice);
                    console.log('Using cached price:', pricePerKg);
                }
            })
            .catch(error => {
                console.error('Error fetching price:', error);
                alert('Could not retrieve the price. Please try again later.');
            });
    }

    // Load price from local storage if available
    function loadPrice() {
        const cachedPrice = localStorage.getItem('pricePerKg');
        if (cachedPrice) {
            pricePerKg = parseFloat(cachedPrice);
            console.log('Using cached price:', pricePerKg);
        } else {
            fetchPrice();
        }
    }

    // Update price every 30 minutes
    setInterval(fetchPrice, PRICE_CHECK_INTERVAL);
    loadPrice();

    // Update the amount paid or quantity when the other is entered
    const amountBoughtInput = document.querySelector('input[placeholder="Enter Quantity"]');
    const amountPaidInput = document.querySelector('input[placeholder="Enter Amount Paid"]');

    amountBoughtInput.addEventListener('input', function () {
        const amountBought = parseFloat(amountBoughtInput.value);
        if (!isNaN(amountBought) && pricePerKg > 0) {
            const calculatedAmount = (amountBought * pricePerKg).toFixed(2);
            amountPaidInput.value = calculatedAmount;
        }
    });

    amountPaidInput.addEventListener('input', function () {
        const amountPaid = parseFloat(amountPaidInput.value);
        if (!isNaN(amountPaid) && pricePerKg > 0) {
            const calculatedQuantity = (amountPaid / pricePerKg).toFixed(2);
            amountBoughtInput.value = calculatedQuantity;
        }
    });

    // Handle form submission
    saleForm.addEventListener('submit', function (event) {
        event.preventDefault(); 
        loadingOverlay.style.display = 'flex'; 

        const customer = document.querySelector('input[placeholder="Enter Customer Name"]').value || 'Unknown';
        const phone = document.querySelector('input[placeholder="Enter Customer Phone"]').value || 'N/A';
        const amountBought = document.querySelector('input[placeholder="Enter Quantity"]').value;
        const amountPaid = document.querySelector('input[placeholder="Enter Amount Paid"]').value;
        const paymentOption = document.querySelector('select[name="type"]').value;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const workerId = userInfo ? userInfo.id : undefined;

        // // Check if all required fields are filled
        // if (!amountBought || !amountPaid || !paymentOption || !workerId) {
        //     alert('Please fill in all fields.');
        //     loadingOverlay.style.display = 'none';
        //     return;
        // }

        // Create sale data object, ensuring no undefined values
        const saleData = {
            worker_id: workerId,
            customer: customer,
            phone: phone,
            amount_bought: parseFloat(amountBought),
            amount_paid: parseFloat(amountPaid),
            payment_option: paymentOption,
            date: new Date().toISOString()  // Save current datetime
        };

        // Function to save offline sales
       

        // If offline, save the sale and redirect to offline sales list
        if (!navigator.onLine) {
            loadingOverlay.style.display = 'none';
            
        } else {
            // Submit the sale online
            fetch('https://oilgas.pythonanywhere.com/pos/add_sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saleData)
            })
            .then(response => {
                loadingOverlay.style.display = 'none'; 
                if (!response.ok) {
                    throw new Error('Failed to add sale');
                }
                return response.json();
            })
            .then(data => {
                console.log('Sale added successfully:', data);
                alert('Sale added successfully!');
                window.location.href = 'index.html'; 
            })
            .catch(error => {
                loadingOverlay.style.display = 'none';
                console.error('Error adding sale:', error);
              
            });
        }
    });

    // Automatically resubmit offline sales when back online
    window.addEventListener('online', function () {
        const offlineSales = JSON.parse(localStorage.getItem('offlineSales')) || [];
        if (offlineSales.length > 0) {
            offlineSales.forEach(sale => {
                fetch('https://oilgas.pythonanywhere.com/pos/add_sales', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sale)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Offline sale synced:', data);
                    alert('Offline sale synced successfully!');
                })
                .catch(error => {
                    console.error('Failed to sync offline sale:', error);
                });
            });
            localStorage.removeItem('offlineSales'); // Clear offline sales after syncing
        }
    });
});
