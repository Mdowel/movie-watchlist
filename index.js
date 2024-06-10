const searchBtn = document.getElementById("search-btn")
const searchInput = document.getElementById("search-input")
const searchResultsContainer = document.getElementById("search-results-container")
const watchlistMainEl = document.getElementById("watchlist-main")

// get watchlist from local storage //

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []

document.addEventListener('DOMContentLoaded', updateWatchlist)

// search for movies //

searchBtn.addEventListener("click", function(e) {
    e.preventDefault()
    const query = searchInput.value
    if (query) {
        searchMovies(query)
    }
})

function searchMovies(query) {
    fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=488e4582`)
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
    return fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=488e4582`)
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

// display search results //

function displayResults(movies) {
    searchResultsContainer.innerHTML = ''

    if (movies) {
        movies.forEach(movie => {
            const truncatedPlot = movie.Plot.length > 150 ? movie.Plot.substring(0, 150) + '...' : movie.Plot

            const movieEl = document.createElement("div")
            movieEl.className = "movie"
            movieEl.innerHTML = `
            <div class="movie-img-container">
                <img src=${movie.Poster} alt="movie poster not available">
            </div>
            
            <div class="movie-info">
                <div class="info-line">
                    <h3>${movie.Title}</h3><div><i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie.Ratings[0].Value}</div><div>${movie.Year}</div>
                </div>
                <div class="info-line">
                    <div>${movie.Runtime}</div><div> ${movie.Genre}</div>

                    <button class="add-btn">
                        <i class="fa-solid fa-circle-plus"></i>
                        <p>Add to Watchlist</p>
                    </button>

                </div>
                <div class="movie-plot">
                    <span class="truncated-plot">${truncatedPlot}</span>
                    <span class="full-plot hidden">${movie.Plot}</span>
                    ${movie.Plot.length > 150 ? '<button class="full-description-btn">More</button>' : ''}
                </div>
            </div>
            `
            searchResultsContainer.style.height = "100%"
            searchResultsContainer.appendChild(movieEl)
        })

        const addToWatchlistBtns = document.querySelectorAll('.add-btn')
        addToWatchlistBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const responseEl = document.querySelector(".add-btn-response")
                responseEl.classList.remove("hidden")
                setTimeout(function(){
                    responseEl.classList.add("hidden")
                }, 1000)
                const movie = movies[index]
                addToWatchlist(movie)

            })
        })

        const moreInfoBtns = document.querySelectorAll(".full-description-btn")
        moreInfoBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                const plotContainer = btn.parentElement
                const truncatedPlot = plotContainer.querySelector('.truncated-plot')
                const movieFullPlot = plotContainer.querySelector('.full-plot')

                if(truncatedPlot.classList.contains("hidden")){
                    truncatedPlot.classList.remove("hidden")
                    movieFullPlot.classList.add("hidden")
                    btn.innerText = "More"
                }else {
                    truncatedPlot.classList.add("hidden")
                    movieFullPlot.classList.remove("hidden")
                    btn.innerText = "Less"
                }
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

// display watchlist //

function updateWatchlist() {
    watchlistMainEl.innerHTML = ''
    if (watchlist.length === 0) {
        watchlistMainEl.innerHTML = `
        <div id="watchlist-container">
            <div class="watchlist-placeholder">Your watchlist is looking a little empty...</div>
            <div class="add-movies-wrapper">
                <a href="index.html">
                    <i class="fa-solid fa-circle-plus"></i>
                    <span>Let’s add some movies!</span>
                </a>
            </div>
        </div>        
        `
    } else {
        watchlist.forEach((movie, index) => {
            const truncatedPlot = movie.Plot.length > 150 ? movie.Plot.substring(0, 150) + '...' : movie.Plot

            const movieEl = document.createElement("div")
            movieEl.classList = "movie"
            movieEl.innerHTML = `
            <div class="movie-img-container">
                <img src=${movie.Poster} alt="movie poster not available">
            </div>
            
            <div class="movie-info">
                <div class="info-line">
                    <h3>${movie.Title}</h3><div><i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie.Ratings[0].Value}</div><div>${movie.Year}</div>
                </div>
                <div class="info-line">
                    <div>${movie.Runtime}</div><div> ${movie.Genre}</div>
    
                    <button class="remove-btn" data-index="${index}">
                        <i class="fa-solid fa-circle-minus"></i>
                        <p>Remove</p>
                    </button>
    
                </div>
                <div class="movie-plot">
                    <span class="truncated-plot">${truncatedPlot}</span>
                    <span class="full-plot hidden">${movie.Plot}</span>
                    ${movie.Plot.length > 150 ? '<button class="full-description-btn">More</button>' : ''}
                </div>
            </div>
            `
            watchlistMainEl.appendChild(movieEl)
        })
        const moreInfoBtns = document.querySelectorAll(".full-description-btn")
        moreInfoBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                const plotContainer = btn.parentElement
                const truncatedPlot = plotContainer.querySelector('.truncated-plot')
                const movieFullPlot = plotContainer.querySelector('.full-plot')

                if(truncatedPlot.classList.contains("hidden")){
                    truncatedPlot.classList.remove("hidden")
                    movieFullPlot.classList.add("hidden")
                    btn.innerText = "More"
                }else {
                    truncatedPlot.classList.add("hidden")
                    movieFullPlot.classList.remove("hidden")
                    btn.innerText = "Less"
                }
            })
        }) 
    }

    const removeFromWatchlistBtns = document.querySelectorAll('.remove-btn')
    removeFromWatchlistBtns.forEach((btn) => {
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




