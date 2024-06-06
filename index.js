const searchBtn = document.getElementById("search-btn")
const searchInput = document.getElementById("search-input")
const searchResultsContainer = document.getElementById("search-results-container")
const watchlistMainEl = document.getElementById("watchlist-container")

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []

document.addEventListener('DOMContentLoaded', updateWatchlist)

searchBtn.addEventListener("click", function(e) {
    e.preventDefault()
    const query = searchInput.value
    if (query) {
        searchMovies(query)
    }
})

function displayResults(movies) {
    searchResultsContainer.innerHTML = ''

    if (movies) {
        movies.forEach(movie => {
            const movieEl = document.createElement("div")
            movieEl.className = "movie"
            movieEl.innerHTML = `
            <div class="movie-img-container">
                <img src=${movie.Poster} alt="movie poster">
            </div>
            
            <div class="movie-info">
                <div class="info-line">
                    <h3>${movie.Title}</h3><div>${movie.Ratings[0].Value}</div><div>${movie.Year}</div>
                </div>
                <div class="info-line">
                    <div>${movie.Runtime}</div><div> ${movie.Genre}</div>

                    <button class="add-btn">
                        <i class="fa-solid fa-circle-plus"></i>
                        <p>Add to Watchlist</p>
                    </button>

                </div>
                <div>${movie.Plot}</div>
            </div>
            `
            searchResultsContainer.style.height = "100%"
            searchResultsContainer.appendChild(movieEl)
        })

        const addToWatchlistBtns = document.querySelectorAll('.add-btn')
        addToWatchlistBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const movie = movies[index]
                addToWatchlist(movie)
            })
        })
    }
}

function addToWatchlist(movie) {
    if (!watchlist.some(m => m.imdbID === movie.imdbID))
    watchlist.push(movie)
    saveWatchlist()
    updateWatchlist()
}

function updateWatchlist() {
    watchlistMainEl.innerHTML = ''
    if (watchlist.length === 0) {
        watchlistMainEl.innerHTML = `
        <div class="watchlist-placeholder">Your watchlist is looking a little empty...</div>
        `
    } else {
        watchlist.forEach((movie, index) => {
            const movieEl = document.createElement("div")
            movieEl.classList = "movie"
            movieEl.innerHTML = `
            <div class="movie-img-container">
                <img src=${movie.Poster} alt="movie poster">
            </div>
            
            <div class="movie-info">
                <div class="info-line">
                    <h3>${movie.Title}</h3><div>${movie.Ratings[0].Value}</div><div>${movie.Year}</div>
                </div>
                <div class="info-line">
                    <div>${movie.Runtime}</div><div> ${movie.Genre}</div>
    
                    <button class="remove-btn">
                        <i class="fa-solid fa-circle-minus"></i>
                        <p>Remove</p>
                    </button>
    
                </div>
                <div>${movie.Plot}</div>
            </div>
            `
            watchlistMainEl.appendChild(movieEl)
        })
    }

    const removeFromWatchlistBtns = document.querySelectorAll('.remove-btn')
    removeFromWatchlistBtns.forEach((btn, index) => {
        btn.addEventListener("click", function() {
            const index = btn.getAttribute('data-index')
            removeFromWatchlist(index)
        })
    })
}

function removeFromWatchlist(index) {
    watchlist.splice(index, 1)
    saveWatchlist()
    updateWatchlist()
}

function saveWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
}

function searchMovies(query) {
    fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=488e4582`)
    .then(response => response.json())
    .then(data => {
        if (data.Response === "True") {
            const movies = data.Search
            const detailedMoviesPromises = movies.map(movie => getMovieDetails(movie.imdbID))
            Promise.all(detailedMoviesPromises).then(detailedMovies => {
                displayResults(detailedMovies)
            })
        }else{
            searchResultsContainer.innerHTML = `<div id="movie-search-err">
                Unable to find what you’re looking for. Please try another search.
            </div>`
        }
        console.log('Search data:', data); 
    })
    .catch(error => {
        console.error('Error fetching movie data:', error)
    })
}

function getMovieDetails(imdbID) {
    return fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=488e4582`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched movie details:', data);

            if (data.Response === "True"){
                return data
            } else {
                throw new Error('Failed to fetch movie details');
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error)
            return null
        })
}



