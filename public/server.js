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

function getSeveralAlbums(query){
  $.ajax({
    url:`${SPOTIFY_ROOT}/albums?ids=${query}`,
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    success: function (data) {
      return data;
    }
  })
}

let params = getHashParams();

let access_token = params.access_token;


const generate = () => document.getElementById('generate');

const gen = () => {
  const limit = 50;
  const tracks = {};
  let albums = {};
  $.ajax({
    url: `${SPOTIFY_ROOT}/me/top/tracks?limit=${limit}&time_range=short_term`,
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    success: function (data) {
      console.log(data);
      for(let i = 0; i < 50; i++){
        let score = 50-i;
        tracks[data.items[i].name] = score;

        if(!(data.items[i].album.id in albums)){
          albums[data.items[i].album.id] = 0;
        }
        albums[data.items[i].album.id] += score;

        //data.items[i].album.name.toString();
      }
      
      let entries = Object.entries(albums)
      let sorted = entries.sort((a,b) => b[1]-a[1])
      let ids = []
      for(let j = 0; j < 20; j++){
        ids.push(sorted[j][0])
      }
      console.log(ids.toString())
      $.ajax({
        url:`${SPOTIFY_ROOT}/albums?ids=${ids.toString()}`,
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
        success: function (data) {
          console.log(data.albums[0].genres)
        }
      })
    }
  })
    console.log(tracks);
    console.log(albums);
}

generate().addEventListener('click', gen)


