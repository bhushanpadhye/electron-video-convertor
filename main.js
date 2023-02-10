const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');

const {app, ipcMain, BrowserWindow, shell } = electron;

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });
    mainWindow.loadURL(`file://${__dirname}/src/index.html`);
});

ipcMain.on('convertor:videos:added',
    (event, videos) => {

        const promises = _.map(videos, video => {
            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(video.path, (err, metadata) => {
                    video.format = 'mpeg';
                    video.duration = metadata.format.duration;
                    video.fileName = metadata.name;
                    resolve(video);
                })
            })
        });

        Promise.all(promises)
            .then((results) => {
                mainWindow.webContents.send('convertor:videos:metadata', results);
            });
    });

ipcMain.on('convertor:videos:convert:start',
    (event, videos) => {
        const keyNames = Object.keys(videos);
        _.each(keyNames, keyName => {
            const video = videos[keyName];
            const outputName = video.name.split('.')[0];
            const outputDirectory = video.path.split(video.name)[0];
            const outputPath = `${outputDirectory}${outputName}.${video.format}`
            ffmpeg(video.path)
                .output(outputPath)
                .on('progress', ({ timemark }) =>
                    mainWindow.webContents.send('convertor:videos:convert:progress', { video, timemark })
                )
                .on('end', () =>
                    mainWindow.webContents.send('convertor:videos:convert:end', { video, outputPath })
                )
                .run();

        });
    });

ipcMain.on('convertor:videos:showInFolder', (event, outputPath) => {
    shell.showItemInFolder(outputPath);
})