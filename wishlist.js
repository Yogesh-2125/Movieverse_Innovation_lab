// --- 1. CONFIGURATION & DOM SELECTORS ---
const wishlistGrid = document.getElementById('wishlist-grid');
const placeholderText = document.querySelector('.placeholder-text');
const authContainer = document.getElementById('auth-container'); // New

// --- 2. AUTH & WISHLIST STORAGE LOGIC (NEW) ---
// These functions must be identical to script.js

function logout() {
    localStorage.removeItem('geminiFlixUser');
    // Refresh header and wishlist
    setupAuthHeader();
    loadWishlistMovies(); // This will now show the "guest" (empty) list
}

/**
 * UPDATED: Checks for user and displays username
 */
function setupAuthHeader() {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    if (user) {
        authContainer.innerHTML = `
            <span class="nav-link user-greeting">Hi, ${user.username}</span>
            <button id="logout-btn" class="nav-link">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        authContainer.innerHTML = '<a href="login.html" class="nav-link">Login</a>';
    }
}

function getWishlist() {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    const key = user ? `wishlist_${user.email}` : 'movieWishlist_guest';
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveWishlist(wishlist) {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    const key = user ? `wishlist_${user.email}` : 'movieWishlist_guest';
    localStorage.setItem(key, JSON.stringify(wishlist));
}

// --- 3. WISHLIST DISPLAY & REMOVE LOGIC ---

/**
 * Removes a movie from the (user-specific) wishlist.
 */
function removeFromWishlist(imdbID) {
    let wishlist = getWishlist();
    const newWishlist = wishlist.filter(movie => movie.imdbID !== imdbID);
    saveWishlist(newWishlist);
    loadWishlistMovies(); // Refresh UI
}

/**
 * Loads and displays movies from the (user-specific) wishlist.
 */
function loadWishlistMovies() {
    const wishlist = getWishlist(); // Gets user-specific list

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = '';
        placeholderText.style.display = 'block';
    } else {
        placeholderText.style.display = 'none';
        wishlistGrid.innerHTML = '';
        
        wishlist.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';

            const posterUrl = (movie.Poster === 'N/A') 
                ? 'https://via.placeholder.com/300x450.png?text=No+Poster' 
                : movie.Poster;

            // --- This HTML is now simpler ---
            movieCard.innerHTML = `
                <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">
                    <img src="${posterUrl}" alt="${movie.Title} Poster">
                </a>
                
                <button class="btn-wishlist-remove" title="Remove from wishlist">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="movie-card-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                </div>
            `;

            const removeBtn = movieCard.querySelector('.btn-wishlist-remove');
            removeBtn.addEventListener('click', () => {
                removeFromWishlist(movie.imdbID);
            });

            wishlistGrid.appendChild(movieCard);
        });
    }
}

// --- 4. INITIALIZATION ---
// UPDATED: Runs setupAuthHeader on page load
// --- 4. INITIALIZATION ---
// UPDATED: Now includes an "Auth Guard"
document.addEventListener('DOMContentLoaded', () => {
    
    // --- NEW AUTH GUARD ---
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    if (!user) {
        // No user is logged in.
        // Redirect them to the login page immediately.
        alert('You must be logged in to view your wishlist.');
        window.location.href = 'login.html';
        return; // Stop running any more code on this page.
    }
    // --- END AUTH GUARD ---

    // If the code reaches this point, the user is logged in.
    // Proceed to set up the page.
    setupAuthHeader();
    loadWishlistMovies();
});