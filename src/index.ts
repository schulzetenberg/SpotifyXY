import { app, BrowserWindow, ipcMain } from 'electron';
import { enableLiveReload } from 'electron-compile';
const fs = require('fs');
const electronOauth2 = require('electron-oauth2');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload();
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const config = JSON.parse(fs.readFileSync('config/spotify-config.json', 'utf8'));

  const oauthConfig = {
    clientId: config.spotifyId,
    clientSecret: config.spotifySecret,
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

};

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
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('setSpotifyConfig', (event, arg) => {
  fs.writeFile('config/spotify-config.json', JSON.stringify(arg, null, 2), 'utf8');
});

ipcMain.on('getSpotifyConfig', (event, arg) => {
  const config = fs.readFileSync('config/spotify-config.json', 'utf8');
  event.returnValue = config;
});
