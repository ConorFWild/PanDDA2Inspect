# MoorhenElectron
An Electron version of the Moorhen molecular graphics program.

[Moorhen](https://github.com/moorhen-coot/Moorhen/) is a web browser molecular graphics program based on the Coot desktop program. This project is
an Electron App version of Moorhen.

## **Build Instructions**

1. `git clone https://github.com/moorhen-coot/MoorhenElectron.git`
2. `cd MoorhenElectron`
3. `npm install` *I have had most success with emscripten provided npm/node when doing this. YMMV.*
4. `cp -a node_modules/moorhen/public/* public/`  
   `cp -r node_modules/moorhen/moorhen.css ./src/`
5.  Build the app  
  * `npm run make-mac-m1` to make an M1 macOS app and redistributable zip (tested on M1 Mac)
  * `npm run make-mac-intel` to make an Intel macOS app and redistributable zip (tested on M1 and Intel Macs)
  * `npm run make-linux` to make an Linux macOS app and redistributable zip (tested on Linux)
  * `npm run package-win32` to make a Windows app (tested on *Linux*)

`make-win32` should also work, but is not recommended since it may be desirable to replace the minimal copy of the CCP4/refmac monomer library `public/baby-gru/monomers` with a complete copy. Under these circumstances `make-win32` hangs. One can always zip the result of `package-win32` by hand.

The built app appears in the `out` directory:  
 * **Mac** `out/Moorhen-darwin-arm64/Moorhen.app/` for M1 Mac. This can then be run with `open out/Moorhen-darwin-arm64/Moorhen.app/`, or opening `out/Moorhen-darwin-arm64/` in Finder and double clicking on `Moorhen.app`, etc. The zip file is `out/make/zip/darwin/arm64/Moorhen-darwin-arm64-0.9.3.zip`
 * **Linux** `out/Moorhen-linux-x64/Moorhen` for Linux. You can simply run this executable. The zip file is `out/make/zip/linux/x64/Moorhen-linux-x64-0.9.3.zip`.
 * **Windows** `out/Moorhen-win32-x64/Moorhen.exe` for Windows. Building of this has only been tested on Linux, so you will neeed to copy the whole `out/Moorhen-win32-x64/` directory to a Windows machine to test. The best way to do this is probably  
`cd out`  
`zip -r Moorhen-win32-x64.zip Moorhen-win32-x64/`  
and then copy the zip file to a Windows, machine and unzip.
 
## **Moving built files to other machines**
* **Mac** The Mac zip files can be copied to other machines but the unzipped `Moorhen.app` will need to be "blessed" in order for it to run. This can be done with `xattr -rc Moorhen.app` .
* **Linux** The Linux zip file can (under most circumstances) be simply copied to another machine and unzipped. The `Moorhen` executable on the unzippped directory can then be run.
* **Windows** After zipping up the Windows folder (previous section), copy to new machine and unzip. You should be able to tun `Moorhen.exe` in the unpacked directory. You may need to use the `--no-sandbox` option.

## **Updating the Moorhen module (Advanced)**

This project contains a snanshot of (most of) the Moorhen browser based program in the tar file `moorhen-0.9.3.tgz`. It is possible to replace this with a newer version. 

To do this:
1. Build Moorhen, see the [compilation instructions](https://github.com/moorhen-coot/Moorhen/).
2. In the Moorhen build directory do:  
`cd baby-gru`  
`npm run-script build-release`  
`cd dist`  
`npm pack  `  
3. Then copy the new tar file `moorhen-x.y.z.tgz` produced in `baby-gru/dist/` into the top-level directory of *this* project (Moorhen Electron).
4. `cd` back to this project
5. `rm -fr build out node_modules package-lock.json`
6. Edit `package.json` to change `"moorhen": "^0.12.3"` to the local file (`"moorhen": "file:///full_path_to/moorhen-x.y.z.tgz"`)
7. Follow steps 3-5 of the **Build Instruction** at the top of this README.

## **Using a complete CCP4/Refmac monomer library(Advanced)**

Before doing step 5 of **Build Instruction**, replace `public/baby-gru/monomers` with a complete copy of the monomer linbrary from a CCP4 installation or from the [LMB github repository](https://github.com/MonomerLibrary/monomers).

<!--
## **Creating a remote controlled Electron App (Advanced)**

**This is an example of extending Moorhen Electron. Most users will not want to be doing this!**

This repository also contains code that would allow you to create an Electron Moorhen that you can partially remotely
control. Specifically you can request loading of coordinate files by "telling" the server to load a particular URL.
To do this, there are a couple of custom steps:
1. `cp remote_control_example/electron.js  public`  
This replaces the server part of the app with one which interprets certain requests as instructions to load files. These instructions are stored in a variable until the client grabs the requests.
2. Edit `src/App.tsx` to be the following (just 2 line edit from original):  
```import './App.css';
import './moorhen.css';
import { MoorhenContainer } from 'moorhen';
import { MoorhenContainer, MoorhenReduxStore } from 'moorhen';
import { Provider } from 'react-redux';
import {MoorhenRemoteControl} './MoorhenRemoteControl'

function App() {
  return (
    <div className="App">
      <Provider store={MoorhenReduxStore}> 
        <MoorhenRemoteControl/>
      </Provider>
    </div>
  );
}

export default App;
```

After that then just rebuild the Electron app. e.g. `npm run make-mac-m1`.

With that done, when the app is running you can request it to load a file from a URL with a server request such as:  
`http://localhost:32778/load/protocal/https/server/www.ebi.ac.uk/path/pdbe/entry-files/download/8fcb.cif`  
You can do this by simply typing the above URL into a web browser on the same machine that the electron app is running.  
This will ask the Moorhen Electron app to load:  
`https://www.ebi.ac.uk/pdbe/entry-files/download/8fcb.cif` .
-->

## **References**

* Coot
    * P. Emsley; B. Lohkamp; W.G. Scott; Cowtan (2010). *Features and Development of Coot*, Acta Crystallographica. **D66 (4)** p486–501.
* Moorhen
    * [Moorhen](https://github.com/moorhen-coot/Moorhen/) a web browser molecular graphics program based on the Coot desktop program.
* CCP4
    * Winn MD, Ballard CC, Cowtan KD, Dodson EJ, Emsley P, Evans PR, Keegan RM, Krissinel EB, Leslie AGW, McCoy A, McNicholas SJ, Murshudov GN, Pannu NS, Potterton EA, Powell HR, Read RJ, Vagin A, Wilson KS (2011), *Overview of the CCP4 suite and current developments*, Acta Cryst **D67**, p235–242.
  
