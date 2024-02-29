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

let params = getHashParams();

let access_token = params.access_token;



const generate = () => document.getElementById('generate');

const gen = () => {
  const limit = 50;
  $.ajax({
    url: `${SPOTIFY_ROOT}/me/top/tracks?limit=${limit}&time_range=short_term`,
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    success: function (data) {
      console.log(data);
    }
  })
    console.log(access_token);
}

generate().addEventListener('click', gen)


