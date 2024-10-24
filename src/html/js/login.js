// Function to handle login API call
async function login(username, password) {
    try {
        const response = await fetch('https://oilgas.pythonanywhere.com/user/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Failed to log in');
        }

        // Parse and return the response data
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error during login:', error);
        return { error: error.message };
    }
}

// Function to show loading indicator
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

// Function to hide loading indicator
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Function to handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;

    // Show the loading indicator
    showLoading();

    // Disable the login button to prevent multiple submissions
    const loginButton = document.querySelector('button[type="submit"]');
    loginButton.disabled = true;

    // Call the login function
    const result = await login(username, password);

    // Hide the loading indicator
    hideLoading();

    // Re-enable the login button
    loginButton.disabled = false;

    if (result.token) {
        console.log('Login successful!', result);

       // Store user information using localStorage
        localStorage.setItem('userInfo', JSON.stringify({
            username: username,
            token: result.token,
            id: result.user.id // Assuming the response includes a user ID
        }));

        // alert('Redirecting to index.html...');
        // // Navigate to index.html if login is successful
        // alert('User Info: ' + localStorage.getItem('userInfo'));
        // alert('User ID: ' + JSON.parse(localStorage.getItem('userInfo')).id);


        window.location.href = 'index.html';

    } else {
        console.error('Login failed:', result.error);
        alert('Login failed: ' + result.error);
    }
});
