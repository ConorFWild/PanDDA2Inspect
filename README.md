# PanDDA 2 Inspect
An Electron/Moorhen implementation of `pandda.inspect` for visualizing and modelling the results of PanDDA and PanDDA 2.

## **Build Instructions**

The build instructions are identical to the [original repository](./MoorhenElectronREADME.md) for Electron/Moorhen from which this is forked.

An additional reccomended step is to add `pandda.inspect` to your path like so:

```bash
# Linux
echo "alias pandda.inspect=\"$(readlink -f .)/out/Moorhen-linux-x64/Moorhen\"" >> ~/.bashrc

# Mac (M1)
echo "alias pandda.inspect=\"$(readlink -f .)/out/Moorhen-darwin-arm64/Moorhen.app/Contents/MacOS/Moorhen\"" >> ~/.bashrc
```

Then, after opening a new console, the program can be run with:

```bash
pandda.inspect /path/to/pandda/output
```

## Debugging

### Parts of the UI are not visible

PanDDA 2 Inspect has been tested fullscreen on 1920x1080 screens, and should work correctly on these. If your screen resolution is smaller than this or if you are not fullscreen you may see graphical anomolies. 

### The program failed to run

If the program fails to run (especially when using NoMachine to Diamond Light Source) with the error:

```bash
Trace/breakpoint trap (core dumped)
```

this is because there is not enough system RAM. The only solution to this is to run the program on a different machine. 

At Diamond Light Source if you NoMachine to a workstation (for example @i04-1-ws001) rather than a server node (for example @cs05r-sc-serv-05) then it will work on those machines!

## **References**

* Coot
    * P. Emsley; B. Lohkamp; W.G. Scott; Cowtan (2010). *Features and Development of Coot*, Acta Crystallographica. **D66 (4)** p486–501.
* Moorhen
    * [Moorhen](https://github.com/moorhen-coot/Moorhen/) a web browser molecular graphics program based on the Coot desktop program.
* CCP4
    * Winn MD, Ballard CC, Cowtan KD, Dodson EJ, Emsley P, Evans PR, Keegan RM, Krissinel EB, Leslie AGW, McCoy A, McNicholas SJ, Murshudov GN, Pannu NS, Potterton EA, Powell HR, Read RJ, Vagin A, Wilson KS (2011), *Overview of the CCP4 suite and current developments*, Acta Cryst **D67**, p235–242.
* PanDDA
    * Pearce, N., Krojer, T., Bradley, A. et al. A multi-crystal method for extracting obscured crystallographic states from conventionally uninterpretable electron density. Nat Commun **8**, 15123 (2017). https://doi.org/10.1038/ncomms15123
* PanDDA 2
    * [PanDDA 2](https://github.com/ConorFWild/pandda_2_gemmi) 