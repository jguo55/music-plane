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

const rows = (i) => {
  i-- //ok yknow this code is really sloppy but who cares
  do {
    i++
  } while (!Number.isInteger(Math.sqrt(i)))
  return Math.sqrt(i)
}

let params = getHashParams();

let access_token = params.access_token;

if(access_token){
  $('#loggedin').show();
}
else {
  $('#loggedin').hide();
}

const generate = () => document.getElementById('generate');

const tr_btn = document.getElementById("time range")

const gen = () => {
  //clear the old images
  document.getElementById('quadrant1').replaceChildren();
  document.getElementById('quadrant2').replaceChildren();
  document.getElementById('quadrant3').replaceChildren();
  document.getElementById('quadrant4').replaceChildren();


  const limit = 50; //Spotify says the limit for artist endpoint is 100, when in reality it is 50
  let time_range = tr_btn.value;
  let offset = 0;

  const genres = {};
  const albums = {};
  let ids = '';
  let ids2 = '';
  const ranking = {};

  let result = [];
  
  $.ajax({
    url: `${SPOTIFY_ROOT}/me/top/tracks?limit=${limit}&time_range=${time_range}&offset=${offset}`,
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
          for(let i = 0; i < items.length; i++){
            if(items[i] === undefined){
              break;
            }
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
                      if(!(genres[x].includes(artists[i].name))){
                        genres[x].push(artists[i].name)
                      }
                    }
                  }
                  let popular = [];
                  for(const[key, value] of Object.entries(genres)){
                    let total = 0;
                    let len = 0;
                    for(let x of genres[key]){
                      total += ranking[x]
                      len += albums[x].length
                    }
                    //if more than 9 albums, then the genre is too broad don't add (unless it's just one artist, thank brandon and his shostakovich obsession)
                    if(!(len > 9) || (len > 9 && genres.length == 1)){
                      popular.push([total, key])
                    }
                  }
                  popular = popular.sort(function(a, b) { //sort by popularity
                    return b[0] - a[0];
                  });                  
                  //add top non intersecting genres to results until there are 4
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
                    let urls = []
                    let width = 98;
                    for(let y of result[x-1]){
                      for(let z of albums[y]){ //rip optimization
                        urls.push(z)
                      }
                    }
                    width = 100/rows(urls.length)-2
                    for(let y of urls){
                    const img = document.createElement("img");
                    img.src = y
                    const src = document.getElementById("quadrant"+x);
                    src.appendChild(img);
                    img.style.verticalAlign = "bottom";
                    img.style.maxHeight = "auto";
                    img.style.padding = "1%";
                    img.style.maxWidth = width+"%"
                    }
                  }
                  console.log(items)
                  console.log(albums)
                  console.log(artists)
                  console.log(ranking)
                  console.log(genres)
                  console.log(popular)
                  console.log(result)
                }
              })
            }
          })
        }
      })
    }
  })
}

generate().addEventListener('click', gen)
