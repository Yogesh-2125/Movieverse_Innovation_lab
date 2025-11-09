document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username'); // NEW
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the form from submitting

        const username = usernameInput.value; // NEW
        const email = emailInput.value;
        const password = passwordInput.value;

        
        if (username && email && password) { // UPDATED
            // Login "success"!
            
            // 1. Create a "user" object to save.
            const user = {
                username: username, // ADDED
                email: email
            };

            // 2. Save the user to localStorage
            localStorage.setItem('geminiFlixUser', JSON.stringify(user));

            // 3. Redirect back to the homepage
            window.location.href = 'index.html';

        } else {
            loginError.textContent = 'Please fill in all fields.';
        }
    });
});