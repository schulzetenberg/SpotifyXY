const Q = require('q');

const logger = require('./log');
const api = require('./api');

function getAuth(config) {
  const postOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: { grant_type: "client_credentials" },
    auth: {
      user: config.spotifyId,
      password: config.spotifySecret
    }
  };

  logger.debug('Post opts', postOptions);

  return api.post(postOptions);
}

exports.getPlaylists = function() {
  logger.debug('Starting get playlists');
  const defer = Q.defer();
  const config = require('../config/spotify-config');

  getAuth(config).then(function(data) {
    logger.debug('Playlist data', data);
    const accessToken = data && data.access_token;

    if(accessToken){
      const getOptions = {
        url: `https://api.spotify.com/v1/users/${config.username}/playlists?limit=50`,
        headers: { Authorization: 'Bearer ' + accessToken }
      };
      return getOptions;
    } else {
      return Promise.reject('Error parsing access token');
    }
  }).then(api.get)
  .then(function(data) {
    logger.debug('API get data', data);
    defer.resolve(data);
  }).catch(function(err){
    logger.error(err);
    defer.reject('Get Spotify data error');
  });

  return defer.promise;
};
