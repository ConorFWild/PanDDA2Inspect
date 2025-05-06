# PanDDA 2 Inspect
An Electron/Moorhen implementation of `pandda.inspect` for visualizing and modelling the results of PanDDA and PanDDA 2.

## **Build Instructions**

The build instructions are identical to the [original repository](./MoorhenElectronREADME.md) for Electron/Moorhen from which this is forked.

An additional reccomended step is to add `pandda.inspect` to your path like so:

```bash
# Linux
echo "alias pandda.inspect=\"$(readlink -f .)/out/Moorhen-linux-x64/Moorhen\"" >> ~/.bashrc

# Mac
echo "alias pandda.inspect=\"$(readlink -f .)/out/Moorhen-darwin-arm64/Moorhen.app/Contents/MacOS/Moorhen\"" >> ~/.bashrc
```

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