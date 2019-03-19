// https://medium.com/how-to-electron/how-to-reset-application-data-in-electron-48bba70b5a49

const path = require('path');
const { app } = require('electron');
const fs = require('fs-extra');

const appName = app.getName();

exports.clearAppData = function() {
  // Get app directory
  // on OSX it's /Users/Yourname/Library/Application Support/AppName
  const appPath = path.join(app.getPath('appData'), appName);

  // Remove spotifyxy directory and all files inside of it
  fs.remove(appPath)
  .then(() => {
    app.relaunch();
    app.exit();
  })
  .catch(err => {
    console.error('Error clearing app data', err);
    // TODO: Send error message to front-end
  });

};
