// Function to load sales from local storage and display them
function loadSales() {
  const salesList = JSON.parse(localStorage.getItem('sales')) || [];
  const salesTableBody = document.getElementById('sales-list');
  salesTableBody.innerHTML = '';

  salesList.forEach((sale, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>
              <div class="checkbox d-inline-block">
                  <input type="checkbox" class="checkbox-input" id="checkbox${index}">
                  <label for="checkbox${index}" class="mb-0"></label>
              </div>
          </td>
          <td>${sale.date}</td>
          <td>${sale.customer}</td>
          <td>${sale.product}</td>
          <td>${sale.totalKg}</td>
          <td>${sale.amountPaid}</td>
          <td>${sale.paymentOption}</td>
          <td>
              <button class="btn btn-danger" onclick="deleteSale(${index})">Delete</button>
              <button class="btn btn-info" onclick="viewReceipt(${index})">View Receipt</button>
          </td>
      `;
      salesTableBody.appendChild(row);
  });
}

// Function to add a new sale
document.getElementById('sale-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const sale = {
      date: document.getElementById('sale-date').value,
      customer: document.getElementById('customer-name').value,
      product: document.getElementById('product-name').value,
      totalKg: document.getElementById('total-kg').value,
      amountPaid: document.getElementById('amount-paid').value,
      paymentOption: document.getElementById('payment-option').value,
  };

  const salesList = JSON.parse(localStorage.getItem('sales')) || [];
  salesList.push(sale);
  localStorage.setItem('sales', JSON.stringify(salesList));

  this.reset(); // Clear the form
  loadSales(); // Refresh the sales table
});

// Function to delete a sale
function deleteSale(index) {
  const salesList = JSON.parse(localStorage.getItem('sales')) || [];
  salesList.splice(index, 1); // Remove the sale at the specified index
  localStorage.setItem('sales', JSON.stringify(salesList));
  loadSales(); // Refresh the sales table
}

// Function to view the receipt for a specific sale
function viewReceipt(index) {
  const salesList = JSON.parse(localStorage.getItem('sales')) || [];
  const sale = salesList[index];

  // Save the selected sale data to localStorage for the receipt
  localStorage.setItem('currentSale', JSON.stringify(sale));

  // Redirect to the receipt page
  window.location.href = 'pages-invoice.html'; // Adjust the path if needed
}

// Load sales on page load
document.addEventListener('DOMContentLoaded', loadSales);
