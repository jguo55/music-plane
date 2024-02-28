const SPOTIFY_ROOT = 'https://api.spotify.com/v1';


async function getToken() {
    const response = await fetch('/auth/token');
    const json = await response.json();
    return json.access_token;
  }

const token = getToken();

const generate = () => document.getElementById('generate');

const gen = () => {
    console.log(token);
}

generate().addEventListener('click', gen)


