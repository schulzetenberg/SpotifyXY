import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as _ from 'lodash';
import { clearAppData } from './node/storage';

const fs = require('fs');
const electronOauth2 = require('electron-oauth2');
const Store = require('electron-store');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

const userSettings = new Store({
  name: 'user-settings',
  defaults: {
    windowBounds: { width: 9999, height: 9999 },
    userEditable: {
      rememberWindowSize: true,
      spotifyUsername: '',
      spotifyId: 'ODI2NTI3NTlmMGE4NDM4YmE5NjE3YzZkZTIzZWI1MWU=',
      spotifySecret: 'MmMzNjY5OTFkYWI3NDU5M2I1NGVjODViYzY5MGUxY2E=',
      favoritePlaylists: [],
      seekSeconds: 30
    }
  }
});

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const savedWidth = userSettings.get('windowBounds.width');
  const savedHeight = userSettings.get('windowBounds.height');
  let width, height;

  if (!userSettings.get('userEditable.rememberWindowSize')) {
    width = size.width;
    height = size.height;
  } else {
    // Set the window size to the previously saved value, up to the full screen size
    width = (size.width < savedWidth) ? size.width : savedWidth;
    height = (size.height < savedHeight) ? size.height : savedHeight;
  }

  // Create the browser window
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    minWidth: 650,
    minHeight: 150
  });

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4200');

    // If in dev mode, open dev tools at startup
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }


  win.on('resize', () => {
    // Save updated window size
    const { width, height } = win.getBounds();
    userSettings.set('windowBounds', { width, height });
  });

  // Emitted when the window is closed
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  function convertIds(data) {
    return new Buffer(data, 'base64').toString('utf8');
  }

  const oauthConfig = {
    clientId: convertIds(userSettings.get('userEditable.spotifyId')),
    clientSecret: convertIds(userSettings.get('userEditable.spotifySecret')),
    authorizationUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    useBasicAuthorizationHeader: false,
    redirectUri: 'http://localhost'
  };

  const windowParams = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false
    }
  };

  const options = {
    // Give Spotify API full permissions (for now) TODO: Limit scope
    scope: 'user-read-private user-read-email user-read-birthdate playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative user-top-read user-read-recently-played user-library-read user-library-modify user-read-currently-playing user-modify-playback-state user-read-playback-state user-follow-modify user-follow-read streaming',
    accessType: 'ACCESS_TYPE',
};

  const electronOAuth = electronOauth2(oauthConfig, windowParams);

  ipcMain.on('spotify-oauth', (event: any, arg: any) => {
    electronOAuth.getAccessToken(options).then(token => {
      console.log('TOKEN', token);
      event.sender.send('spotify-oauth-reply', token);
    }, err => {
      console.log('Error while getting token', err);
    });
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

ipcMain.on('logout', (event, arg) => {
  clearAppData();
});

// Pass the config that should be changed. The changes will be merged with the existing config and saved.
ipcMain.on('setSpotifyConfig', (event, arg) => {
  const settings = _.merge(userSettings.get('userEditable'), arg);
  userSettings.set('userEditable', settings);
});

ipcMain.on('getSpotifyConfig', (event, arg) => {
  event.returnValue = userSettings.get('userEditable');
});

ipcMain.on('viewUserSettingsFile', (event, arg) => {
  userSettings.openInEditor();
});
