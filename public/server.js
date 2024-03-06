const SPOTIFY_ROOT = 'https://api.spotify.com/v1';

const getHashParams = () => {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};

function removeDuplicates(value, index, array){
  return array.indexOf(value) === index
}

function nextSquare(int){
  let i = 0;
  do {
    i++
  } while (i*i <= int)
  return i
}

let params = getHashParams();

let access_token = params.access_token;

//genres that are too broad or don't exist
//const exclude = ['pop', 'rap', 'rock', 'pov: indie']

const generate = () => document.getElementById('generate');

const gen = () => {
  const limit = 50; //Spotify says the limit for artist endpoint is 100, when in reality it is 50
  let offset = 0;

  const genres = {};
  const albums = {};
  let ids = '';
  let ids2 = '';
  let ranking = {};

  let result = [];
  
  //array of top 100 albums separated into 2 api calls
  $.ajax({
    url: `${SPOTIFY_ROOT}/me/top/tracks?limit=${limit}&time_range=short_term&offset=${offset}`,
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    success: function (data) {
      $.ajax({
        url: data.next,
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
        success: function (data2) {
          const items = data.items.concat(data2.items) //combine data
          console.log(items)
          for(let i = 0; i < 100; i++){
            if(!(items[i].artists[0].name in albums)){
              albums[items[i].artists[0].name] = []
            }
            if(!(items[i].album.images.length == 0) && !(albums[items[i].artists[0].name].includes(items[i].album.images[0].url))){
              albums[items[i].artists[0].name].push(items[i].album.images[0].url) //albums from artist that user listens to
            }
            if(i < 50) { //ids for artist api call
              i == 49 ? ids += items[i].artists[0].id: ids += items[i].artists[0].id + ',';
            } else {
              i == 99 ? ids2 += items[i].artists[0].id: ids2 += items[i].artists[0].id + ',';
            }
          }
          $.ajax({
            url:`${SPOTIFY_ROOT}/artists?ids=${ids}`,
            headers: {
              Authorization: 'Bearer ' + access_token,
            },
            success: function (data) {
              $.ajax({
                url: `${SPOTIFY_ROOT}/artists?ids=${ids2}`,
                headers: {
                  Authorization: 'Bearer ' + access_token,
                },
                success: function(data2){
                  const artists = data.artists.concat(data2.artists) //combine artists
                  for(let i = 0; i < 100; i++){
                    artists[i].name in ranking ? ranking[artists[i].name] += 100-i : ranking[artists[i].name] = 100-i; //artist popularity ranking algorithm
                    for(let x of artists[i].genres){
                      if(!(x in genres)){
                        genres[x] = [];
                      }
                      genres[x].push(artists[i].name) //include duplicates to find genres that user listens to the most
                    }
                  }
                  let popular = [];
                  for(const[key, value] of Object.entries(genres)){
                    genres[key] = value.filter(removeDuplicates) //remove duplicates
                    let total = 0;
                    for(let x of genres[key]){
                      total += ranking[x]
                    }
                    popular.push([total, key])
                    if(genres[key].length > 5){ // if more than 9 albums too broad
                      for(let x of popular){
                        if(x[1] == key){
                          popular.splice(popular.indexOf(x), popular.indexOf(x))
                        }
                      }
                    }
                  }
                  popular = popular.sort(function(a, b) { //sort by popularity
                    return b[0] - a[0];
                  });
                  console.log(popular)
                  
                  //add top non intersecting genres to results until there are 4
                  //i would like to use Set.intersection but it is not widely supported
                  result.push(genres[popular[0][1]]) //add top result
                  for(x of popular){
                    let intersects = false
                    for(y of result){
                      if(y.filter(value => genres[x[1]].includes(value)).length > 0){
                        intersects = true
                      }
                    }
                    if(!intersects){
                      result.push(genres[x[1]])
                    }
                    if(result.length >= 4){
                      break;
                    }
                  }
                  //add images to body
                  for(let x = 1; x <= result.length;x++){
                    for(let y of result[x-1]){
                      for(let z of albums[y]){ //rip optimization
                        const img = document.createElement("img");
                        img.src = z
                        const src = document.getElementById("quadrant"+x);
                        src.appendChild(img);
                        img.style.maxWidth = "30%";
                        img.style.maxHeight = "auto";
                        img.style.verticalAlign = "bottom";
                        img.style.padding = "1%"
                      }
                    }
                  }
                }
              })
            }
          })
        }
      })
    }
  })
    console.log(genres)
    console.log(albums)
    console.log(ranking)
}

generate().addEventListener('click', gen)


