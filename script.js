// --- 1. CONFIGURATION & DOM SELECTORS ---

// !! PASTE YOUR OMDb API KEY HERE !!
const API_KEY = 'fbf6fbed'; // <-- IT MUST BE REPLACED
const API_URL = `http://www.omdbapi.com/?i=tt3896198&apikey=fbf6fbed`;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const topMoviesContainer = document.getElementById('top-movies-container');
const topSeriesContainer = document.getElementById('top-series-container');
const topTvShowsContainer = document.getElementById('top-tv-shows-container');
const topchildshowsContainer = document.getElementById('top-child-shows-container');
const topKidsContainer = document.getElementById('top-kids-container');
const authContainer = document.getElementById('auth-container');
const wishlistLink = document.getElementById('wishlist-link');

async function searchMovies(searchTerm) {
    resultsContainer.innerHTML = '<p class="placeholder-text">Searching...</p>';
    try {
        const response = await fetch(`${API_URL}&s=${searchTerm}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.Response === 'True') {
            displayMovies(data.Search, resultsContainer, 'grid');
        } else {
            displayError(data.Error);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        displayError('Something went wrong. Please try again.');
    }
}

async function fetchSingleMovie(title, container) {
    try {
        const response = await fetch(`${API_URL}&t=${title}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.Response === 'True') {
            displayMovies([data], container, 'row');
        } else {
            console.warn(`Could not find top pick: ${title}`);
        }
    } catch (error) {
        console.error(`Fetch error for ${title}:`, error);
    }
}

function displayMovies(movies, container, layout) {
    if (layout === 'grid') {
        container.innerHTML = '';
    }
    const currentWishlist = getWishlist(); // Now user-specific

    movies.forEach(movie => {
        const isInWishlist = currentWishlist.some(m => m.imdbID === movie.imdbID);
        const movieCard = document.createElement('a');
        movieCard.className = 'movie-card';
        movieCard.href = `https://www.imdb.com/title/${movie.imdbID}`;
        movieCard.target = '_blank';

        const posterUrl = (movie.Poster === 'N/A') 
            ? 'https://via.placeholder.com/300x450.png?text=No+Poster' 
            : movie.Poster;

        // --- This HTML is now simpler ---
        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.Title} Poster">
            <button class="btn-wishlist ${isInWishlist ? 'active' : ''}" 
                    title="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                <i class="${isInWishlist ? 'fas fa-heart' : 'far fa-heart'}"></i>
            </button>
            <div class="movie-card-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `;

        const wishlistBtn = movieCard.querySelector('.btn-wishlist');
        wishlistBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(movie, wishlistBtn);
        });
        container.appendChild(movieCard);
    });
}

function displayError(message) {
    resultsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${API_URL}&i=${imdbID}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.Response === 'True') {
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}


// --- 3. WISHLIST LOGIC (UPDATED) ---

// NOTE: This function is no longer 'async'
function toggleWishlist(movie, btnElement) {
    // --- NEW AUTH GUARD ---
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    if (!user) {
        // No user is logged in. Redirect to the login page.
        // We can also add a helpful alert.
        alert('Please log in to add movies to your wishlist.');
        window.location.href = 'login.html';
        return; // Stop the function here.
    }
    // --- END AUTH GUARD ---

    // If we are here, the user is logged in. Proceed as normal.
    let wishlist = getWishlist(); // Gets user-specific list
    const movieIndex = wishlist.findIndex(m => m.imdbID === movie.imdbID);
    const heartIcon = btnElement.querySelector('i');

    if (movieIndex === -1) {
        // ADDING MOVIE
        wishlist.push(movie); 
        saveWishlist(wishlist);
        
        btnElement.classList.add('active');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        btnElement.title = 'Remove from wishlist';
    } else {
        // REMOVING MOVIE
        wishlist.splice(movieIndex, 1);
        saveWishlist(wishlist);
        
        btnElement.classList.remove('active');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        btnElement.title = 'Add to wishlist';
    }
}

/**
 * UPDATED: Now gets wishlist based on logged-in user
 */
function getWishlist() {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    const key = user ? `wishlist_${user.email}` : 'movieWishlist_guest'; // User-specific or guest key
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * UPDATED: Now saves wishlist based on logged-in user
 */
function saveWishlist(wishlist) {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    const key = user ? `wishlist_${user.email}` : 'movieWishlist_guest';
    localStorage.setItem(key, JSON.stringify(wishlist));
}


// --- 4. AUTH LOGIC (NEW) ---

/**
 * Logs the user out
 */
function logout() {
    localStorage.removeItem('geminiFlixUser');
    // Refresh header and movie lists (which are now tied to the user)
    setupAuthHeader();
    loadHomePageRows(); // Re-load rows to show correct wishlist hearts for "guest"
    resultsContainer.innerHTML = '<p class="placeholder-text">Search for a movie to see results.</p>';
}

/**
 * Checks for user in localStorage and updates header
 */
/**
 * UPDATED: Checks for user and displays username
 */
function setupAuthHeader() {
    const user = JSON.parse(localStorage.getItem('geminiFlixUser'));
    if (user) {
        // User is logged in
        authContainer.innerHTML = `
            <span class="nav-link user-greeting">Hi, ${user.username}</span>
            <button id="logout-btn" class="nav-link">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
        wishlistLink.style.display = 'block'; // Show the wishlist link
    } else {
        // User is logged out
        authContainer.innerHTML = '<a href="login.html" class="nav-link">Login</a>';
        wishlistLink.style.display = 'none'; // Hide the wishlist link
    }
}


// --- 5. EVENT LISTENERS & INITIALIZATION ---

function handleSearch(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        searchMovies(searchTerm);
    }
}

async function loadHomePageRows() {
    // ... (Your existing loadHomePageRows function is perfect, copy it here) ...
    // --- List 1: Top Movies ---
    const topMovies = [
        "Inception", "The Dark Knight", "Jerry Maguire", "Leo", "The Matrix", "Dune","Leo"
    ];
    topMoviesContainer.innerHTML = ''; 
    for (const title of topMovies) {
        await fetchSingleMovie(title, topMoviesContainer);
    }

    // --- List 2: Top Series ---
    const topSeries = [
        "Breaking Bad", "Game of Thrones", "Stranger Things", "Dark", "The Boys","Loki","The Summer I Turned Pretty"
    ];
    topSeriesContainer.innerHTML = '';
    for (const title of topSeries) {
        await fetchSingleMovie(title, topSeriesContainer);
    }

    // --- List 3: Top TV Shows ---
    const topTvShows = [
        "Friends", "The Office", "Chernobyl", "Ted Lasso", "The Crown","Mr Bean","Last of Us"
    ];
    topTvShowsContainer.innerHTML = '';
    for (const title of topTvShows) {
        await fetchSingleMovie(title, topTvShowsContainer);
    }
    
    // --- List 4: Top Kids Shows ---
    const topKidsShows = [
        "SpongeBob SquarePants", "Avatar: The Last Airbender", "Bluey", "Peppa Pig", "Paw Patrol","Dora the Explorer","Ben 10 Alien Force"
    ];
    topKidsContainer.innerHTML = '';
    for (const title of topKidsShows) {
        await fetchSingleMovie(title, topKidsContainer);
    }
}

/**
 * UPDATED: Runs setupAuthHeader on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    setupAuthHeader(); // Checks if user is logged in
    searchForm.addEventListener('submit', handleSearch);
    loadHomePageRows(); // Loads rows (and shows correct heart icons for user)
});