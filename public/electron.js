const { app, BrowserWindow, crashReporter} = require("electron");

console.log(app.getPath('crashDumps'))
crashReporter.start({ submitURL: '', uploadToServer: false })

const path = require("path");
const express = require('express');
const process = require('process');
const fs = require("fs");


const isDev = require("electron-is-dev");

const { ipcMain } = require('electron');
const yargs = require('yargs');
const { format, writeToPath } = require('@fast-csv/format');
const { parse } = require('fast-csv');
const { pipeline } = require('node:stream/promises');


let panddaInspectColumns = [
  'dtag',
  'event_idx',
  'bdc',
  'cluster_size',
  'global_correlation_to_average_map',
  'global_correlation_to_mean_map',
  'local_correlation_to_average_map',
  'local_correlation_to_mean_map',
  'site_idx',
  'x',
  'y',
  'z',
  'z_mean',
  'z_peak',
  'applied_b_factor_scaling',
  'high_resolution',
  'low_resolution',
  'r_free',
  'r_work',
  'analysed_resolution',
  'map_uncertainty',
  'analysed',
  'interesting',
  'exclude_from_z_map_analysis',
  'exclude_from_characterisation',
  '1-BDC',
  'Interesting',
  'Ligand Placed',
  'Ligand Confidence',
  'Comment',
  'Viewed'
];

let panddaInspectColumnTypes = {
    'dtag': String,
    'event_idx': parseInt,
    'bdc': Number,
    'cluster_size': parseInt,
    'global_correlation_to_average_map': Number,
    'global_correlation_to_mean_map': Number,
    'local_correlation_to_average_map': Number,
    'local_correlation_to_mean_map': Number,
    'site_idx': parseInt,
    'x': Number,
    'y': Number,
    'z': Number,
    'z_mean': Number,
    'z_peak':Number,
    'applied_b_factor_scaling': Number,
    'high_resolution': Number,
    'low_resolution': Number,
    'r_free': Number,
    'r_work': Number,
    'analysed_resolution': Number,
    'map_uncertainty': Number,
    'analysed': Boolean,
    'interesting': Boolean,
    'exclude_from_z_map_analysis': Boolean,
    'exclude_from_characterisation': Boolean,
    '1-BDC': Number,
    'Interesting': String,
    'Ligand Placed': String,
    'Ligand Confidence': String,
    'Comment': String,
    'Viewed': String
};


let panddaInspectSitesColumns = [
  'site_idx',
  'centroid',
  'Name',
  'Comment'

];

let panddaInspectSitesColumnTypes = {
  'site_idx': parseInt,
  'centroid': (_x) => {return JSON.parse(_x.replace("(", "").replace(")", "").replace(/^/, '[').replace(/$/, ']'))},
  'Name': String,
  'Comment': String
};
// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

console.log('creating window');



function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, "..", "src", "icons", "png", "128x128.png"),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      webSecurity: false

    }

  });
  // win.webContents.openDevTools();
  console.log(path.join(__dirname, 'preload.js'));



  //   if (process.argv.length > 2) {
  //     win.loadURL(process.argv[2]);
  //   } else if (process.argv.length > 1 && process.argv[1] !== "--no-sandbox") {
  //     win.loadURL(process.argv[1]);
  //   } else {

  let server;

  if (!isDev) {

    const MINPORT = 32778;
    const MAXPORT = 32800;

    const exp = express();

    exp.use(function (req, res, next) {
      res.header("Cross-Origin-Embedder-Policy", "require-corp");
      res.header("Cross-Origin-Opener-Policy", "same-origin");
      next();
    });

    exp.use(express.static(path.join(__dirname, "..", "build")));

    exp.get('/', (req, res) => {
      res.send('Hello World! ' + path.join(__dirname, "..", "build"));
    });

    function serve(port) {
      server = exp.listen(port, () => {
        console.log('Listening on port:', server.address().port);
        win.loadURL("http://localhost:" + server.address().port + "/index.html");
      }).on('error', function (err) {
        if (port < MAXPORT) {
          serve(port + 1);
        } else {
          throw new Error("Run out of ports in Moorhen's range 32778-32800");
        }
      });
    }
    serve(MINPORT);
  } else {
    win.loadURL("http://localhost:9999");
  }





  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(
  async () => {
    const args = yargs(process.argv.slice(1)).parse()._[0];

    const pandaAnalyseEventsPath = path.join(args, 'analyses', 'pandda_analyse_events.csv');
    const pandaInspectEventsPath = path.join(args, 'analyses', 'pandda_inspect_events.csv');
    const pandaAnalyseSitesPath = path.join(args, 'analyses', 'pandda_analyse_sites.csv');
    const pandaInspectSitesPath = path.join(args, 'analyses', 'pandda_inspect_sites.csv');
    let csvPath = pandaAnalyseEventsPath;
    let siteCSVPath = pandaAnalyseSitesPath;
    if (fs.existsSync(pandaInspectEventsPath)) {
      csvPath = pandaInspectEventsPath;
      siteCSVPath = pandaInspectSitesPath;
    }

    console.log(csvPath);
    // const df = pd.readCsv(csvPath);
    const eventTableStream = fs.createReadStream(csvPath);
    const eventTable = []
    const eventTableParseStream = parse({ headers: true })
      .on('error', error => console.error(error))
      .on('data', row => eventTable.push(row))
      .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));
    // stream.write(siteDataFrameString);
    const finishedEventTableStream = await pipeline(eventTableStream, eventTableParseStream)

    for (var eventTableIndex in eventTable) {
      eventTable[eventTableIndex][''] = parseInt(eventTableIndex);
      for (_property in eventTable[eventTableIndex]) {
        if (_property in panddaInspectColumnTypes) {
          eventTable[eventTableIndex][_property] = panddaInspectColumnTypes[_property](eventTable[eventTableIndex][_property]);
        }
      } 
      //eventTable[eventTableIndex]['site_idx'] = parseInt(eventTable[eventTableIndex]['site_idx']);
    }

    // Add inspect records if not alread present
    if (eventTable.length > 0) {
      if (!('Viewed' in eventTable[0])) {
        for (var eventTableIndex in eventTable) {
          eventTable[eventTableIndex]['Interesting'] = 'False';
          eventTable[eventTableIndex]['Ligand Placed'] = 'False';
          eventTable[eventTableIndex]['Ligand Confidence'] = 'Low';
          eventTable[eventTableIndex]['Comment'] = 'None';
          eventTable[eventTableIndex]['Viewed'] = 'False';
        }
      }
    }
    // console.log(eventTable.show);
    console.log(eventTable);

    console.log(siteCSVPath);
    // const siteDataFrame = pd.readCsv(siteCSVPath);
    const siteDataFrameStream = fs.createReadStream(siteCSVPath);
    const siteDataFrame = []
    const parseStream = parse({ headers: true })
      .on('error', error => console.error(error))
      .on('data', row => siteDataFrame.push(row))
      .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));
    // stream.write(siteDataFrameString);
    const finishedStream = await pipeline(siteDataFrameStream, parseStream);
    for (var siteTableIndex in siteDataFrame) {
      for (_property in siteDataFrame[siteTableIndex]) {
        if (_property in panddaInspectSitesColumnTypes) {
          siteDataFrame[siteTableIndex][_property] = panddaInspectSitesColumnTypes[_property](siteDataFrame[siteTableIndex][_property]);
        }
      }
    }
    console.log(siteDataFrame);
    return {
      args: args,
      data: eventTable,
      siteData: siteDataFrame
    }
  }
).then((obj) => {
  const df = obj.data;
  const siteData = obj.siteData;
  const args = obj.args;

  // const loadURL = serve({ directory: args._[0] });
  // loadURL(mainWindow);


  ipcMain.handle('get-args', async (event,) => {
    return path.resolve(yargs(process.argv.slice(1)).parse()._[0])

  })




  ipcMain.handle('get-data', async (event,) => {
    return df
  })

  ipcMain.handle('get-site-data', async (event,) => {
    return siteData
  })

  ipcMain.handle('save-data', async (event, action) => {
    console.log('Saving data...');
    console.log(action.data);
    let data = [];
    for (var index in action.data) {
      record = action.data[index];
      newRecord = [
        record['dtag'],
        record['event_idx'],
        record['bdc'],
        record['cluster_size'],
        record['global_correlation_to_average_map'],
        record['global_correlation_to_mean_map'],
        record['local_correlation_to_average_map'],
        record['local_correlation_to_mean_map'],
        record['site_idx'],
        record['x'],
        record['y'],
        record['z'],
        record['z_mean'],
        record['z_peak'],
        record['applied_b_factor_scaling'],
        record['high_resolution'],
        record['low_resolution'],
        record['r_free'],
        record['r_work'],
        record['analysed_resolution'],
        record['map_uncertainty'],
        record['analysed'],
        record['interesting'],
        record['exclude_from_z_map_analysis'],
        record['exclude_from_characterisation'],
        record['1-BDC'],
        record['Interesting'],
        record['Ligand Placed'],
        record['Ligand Confidence'],
        record['Comment'],
        record['Viewed']
      ];
      data.push(newRecord);
    }
    console.log(data);
    // new_df = pd.DataFrame(data, columns = panddaInspectColumns);
    // console.log(new_df);
    // new_df.toCsv();

    await writeToPath(
      path.join(args, 'analyses', 'pandda_inspect_events.csv'),
      data,
      { headers: panddaInspectColumns }
    );
  })

  ipcMain.handle('save-site-data', async (event, action) => {
    console.log('Saving data...');
    console.log(action.data);
    let data = [];
    for (var index in action.data) {
      record = action.data[index];
      newRecord = [
        record['site_idx'],
        `(${record['centroid'][0]},${record['centroid'][1]},${record['centroid'][2]})`,
        record['Name'],
        record['Comment'],
      ];
      data.push(newRecord);
    }
    console.log(data);
    // new_df = pd.DataFrame(data, columns = panddaInspectColumns);
    // console.log(new_df);
    // new_df.toCsv();

    await writeToPath(
      path.join(args, 'analyses', 'pandda_inspect_sites.csv'),
      data,
      { headers: panddaInspectSitesColumns }
    );
  })

  ipcMain.handle('get-mol', async (event, action) => {
    // const newMolecule = new MoorhenMolecule(commandCentre, glRef);

    // Load molecule into coot instance and draw it using "bonds"
    console.log(action)
    console.log(`pandda_dir is ${action.pandda_dir}`);
    console.log(action.pandda_dir);
    console.log(action.dtag);
    console.log(action.event);
    const mol_path = path.join(action.pandda_dir, 'processed_datasets', action.dtag, 'modelled_structures', `${action.dtag}-pandda-model.pdb`);
    const data = fs.readFileSync(mol_path);
    console.log(data);

    return data;

  })

  ipcMain.handle('get-file-from-path', async (event, action) => {
    // const newMolecule = new MoorhenMolecule(commandCentre, glRef);

    // Load molecule into coot instance and draw it using "bonds"
    // const mol_path = path.join(action.pandda_dir, 'processed_datasets', action.dtag, 'modelled_structures', `${action.dtag}-pandda-model.pdb`);
    const data = fs.readFileSync(action.path);
    // console.log(data);

    return data;
  })

  ipcMain.handle('save-model', async (event, action) => {
    // const newMolecule = new MoorhenMolecule(commandCentre, glRef);

    // Load molecule into coot instance and draw it using "bonds"
    // const mol_path = path.join(action.pandda_dir, 'processed_datasets', action.dtag, 'modelled_structures', `${action.dtag}-pandda-model.pdb`);
    // const data = fs.readFileSync(action.path);
    fs.writeFileSync(action.path, action.pdb, {
      flag: "w"
    })
    // console.log(data); 
  })

  ipcMain.handle('get-ligand-paths', async (event,) => {
    // const newMolecule = new MoorhenMolecule(commandCentre, glRef);
    console.log('Getting ligand files...');
    const dtagDirs = fs.readdirSync(path.join(args, 'processed_datasets'));
    const ligandFiles = new Map(
      dtagDirs.map((_dtagDir) => {
        try {
          dtagLigandFiles = fs.readdirSync(path.join(args, 'processed_datasets', _dtagDir, 'ligand_files')).map(
            (_ligandFile) => { return path.join(args, 'processed_datasets', _dtagDir, 'ligand_files', _ligandFile) }
          ).filter(
            (_ligandFile) => { console.log(_ligandFile); return path.extname(_ligandFile) == '.cif'; }
          );
        } catch (error) {
          console.log(error);
          dtagLigandFiles = [];
        }
        return [path.basename(_dtagDir), dtagLigandFiles];

      }
      )
    );
    console.log(ligandFiles);

    return ligandFiles;
  })

  console.log('creating window');

  createWindow()
  console.log('created window');

  // app.on('ready', async () => {
  //   protocol.registerFileProtocol('app', (request, callback) => {
  //     const url = request.url.replace('app://', '')
  //     try {
  //       return callback(url)
  //     }
  //     catch (error) {
  //       console.error(error)
  //       return callback(404)
  //     }
  //   })
  // }
  // )

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

