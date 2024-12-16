let apiURL = 'https://api.tvmaze.com/';
let epURL = 'https://api.tvmaze.com/episodes/';

// initialize page after HTML loads
window.onload = function() {
  closeLightBox();  // close the lightbox because it's initially open in the CSS
  document.getElementById("button").onclick = function () {
    searchTvShows();
  };
  document.getElementById("lightbox").onclick = function () {
    closeLightBox();
  };
} // window.onload


// make maze installable
// handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});     


// get data from TV Maze
async function searchTvShows() {
  document.getElementById("main").innerHTML = "";
  let search = document.getElementById("search").value;  

  let box = document.getElementById("box");
  box.style.border = "solid 5px";
  box.style.margin = "20px";
  box.style.borderRadius = "20px";
  box.style.backgroundColor = "#f1f1f1";
  box.style.width = "75%";
  box.style.display = "block";
  box.style.marginLeft = "auto";
  box.style.marginRight = "auto";



  try {   
    const response = await fetch(apiURL + 'search/shows?q=' + search);
    const data = await response.json();
    console.log(data);
    showSearchResults(data);
  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch
} // searchTvShows 


// change the activity displayed 
function showSearchResults(data) {
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for
} // updatePage

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
  let output = "<ul>";

  for (g in genres) {
    output += "<li>" + genres[g] + "</li>"; 
  } // for       
  output += "</ul>";
  return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow(tvshowJSON) {
  var elemMain = document.getElementById("main");

  var elemDiv = document.createElement("div");

  var elemImage = document.createElement("img");
  elemImage.classList.add("Image");

  var elemShowTitle = document.createElement("h2");
  elemShowTitle.classList.add("showtitle");

  var elemGenre = document.createElement("div");
  elemGenre.classList.add("genre");

  var elemRating = document.createElement("div");
  elemRating.classList.add("rating");

  var elemSummary = document.createElement("div");
  elemSummary.classList.add("summary");

  // Add JSON data to elements with a fallback for the image
  elemImage.src = tvshowJSON.show.image ? tvshowJSON.show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
  elemShowTitle.innerHTML = tvshowJSON.show.name;
  elemGenre.innerHTML = "Genres: " + showGenres(tvshowJSON.show.genres);
  elemRating.innerHTML = "Rating: " + (tvshowJSON.show.rating.average || 'No rating available');
  elemSummary.innerHTML = tvshowJSON.show.summary || 'No summary available.';

  // Add elements to the div tag
  elemDiv.appendChild(elemShowTitle);
  elemDiv.appendChild(elemGenre);
  elemDiv.appendChild(elemRating);

  elemDiv.appendChild(elemSummary);
  elemDiv.appendChild(elemImage);

  let showId = tvshowJSON.show.id;
  fetchEpisodes(showId, elemDiv);

  elemMain.appendChild(elemDiv);
}

// fetch episodes for a given tv show id
async function fetchEpisodes(showId, elemDiv) {
  console.log("fetching episodes for showId: " + showId);

  try {
    const response = await fetch(apiURL + 'shows/' + showId + '/episodes');  
    const data = await response.json();
    console.log("episodes");
    console.log(data);
    showEpisodes(data, elemDiv);
  } catch(error) {
    console.error('Error fetching episodes:', error);
  } // catch
} // fetch episodes

// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
  let elemEpisodes = document.createElement("div");  // creates a new div tag
  let output = "<ol>";

  for (episode in data) {
    output += "<li><a href='javascript:showLightBox(" + data[episode].id + ")'>" + data[episode].name + "</a></li>";
  }
  output += "</ol>";
  elemEpisodes.innerHTML = output;
  elemEpisodes.classList.add("epiList");
  elemDiv.appendChild(elemEpisodes);  // add div tag to page
} // showEpisodes

// open lightbox and display episode info
function showLightBox(episodeId){
  document.getElementById("lightbox").style.display = "block";

  epInfo(episodeId);
} // showLightBox

// close the lightbox
function closeLightBox(){
  document.getElementById("lightbox").style.display = "none";
} // closeLightBox 

async function epInfo(id) {
  try {
      const response = await fetch(epURL + id);
      const data = await response.json();

      const lightboxContent = `
          <h2 id="name">${data.name}</h2>

          <p>Season: ${data.season}, Episode: ${data.number}</p>

          <img src="${data.image ? data.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" alt="${data.name}" id="image">

          <p>Summary of Episode: ${data.summary || 'No description available.'}</p>
      `;
      document.getElementById("message").innerHTML = lightboxContent;
  } catch (error) {
      console.error('Error fetching episode info:', error);
      document.getElementById("message").innerHTML = "<p>Error trying to fetch episode info</p>";
  }// catch
}// epInfo


// sw
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
}                    
        
