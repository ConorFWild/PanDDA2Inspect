import {
    MoorhenMolecule, addMolecule,
    removeMolecule, MoorhenMap, addMap, removeMap, hideMolecule, hideMap, setActiveMap,
} from 'moorhen';

import path from 'path-browserify';

import { structureFactors } from './PanDDA2Constants';

function tableIdxToEvent(idx, pandda_inspect_state) {
    const record = pandda_inspect_state.data[idx];
    
    return {
        args: pandda_inspect_state.args,
        ligandFiles: pandda_inspect_state.ligandFiles,
        dtag: record.dtag,
        event_idx: record.event_idx,
        site: record.site_idx,
        bdc: record['1-BDC'],
        x: record.x,
        y: record.y,
        z: record.z,
        z_blob_peak: record.z_peak,
        z_blob_size: record.cluster_size,
        resolution: record.high_resolution,
        map_uncertainty: record.map_uncertainty,
        r_work: record.r_work,
        r_free: record.r_free,

        event_comment: record['Comment'],
        event_interesting: record['Interesting'],
        ligand_placed: record['Ligand Placed'],
        ligand_confidence: record['Ligand Confidence'],
    };
}

async function loadMoleculeFromPath(commandCentre, glRef, dispatch, mol_path, mol_name, cifs) {

    if (path && mol_name) {

        const newMolecule = new MoorhenMolecule(commandCentre, glRef);

        const data = await window.electronAPI.getFileFromPath({ path: mol_path });
        console.log(data);

        const chunkSize = 65536
        let pdbStr: string = ""
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            pdbStr += String.fromCharCode.apply(null, chunk);
        }
        console.log(pdbStr);
        console.log(commandCentre);
        console.log(glRef);
        console.log('await load molecule from string...');
        try {
            await newMolecule.loadToCootFromString(pdbStr, mol_name);
        } catch (error) {
            throw error;
        }
        console.log(newMolecule);

        console.log('Adding ligands...')
        if (cifs.length > 0) {
            for (const _cifFilePathIndex in cifs) {
                console.log(`Loading cif from ${cifs[_cifFilePathIndex]}`);
                const ligandData = await window.electronAPI.getFileFromPath({ path: cifs[_cifFilePathIndex] });
                console.log(ligandData);
                const chunkSize = 65536
                let ligandString: string = ""
                for (let i = 0; i < ligandData.length; i += chunkSize) {
                    const chunk = ligandData.slice(i, i + chunkSize);
                    ligandString += String.fromCharCode.apply(null, chunk);
                }
                console.log(ligandString);
                await newMolecule.addDict(ligandString)
            };
        }

        console.log(newMolecule);

        console.log('await draw molecule...');
        await newMolecule.fetchIfDirtyAndDraw('CBs');

        // Dispatch the new molecule to Moorhen
        console.log('await dispatch molecule...');

        await dispatch(addMolecule(newMolecule));

        return newMolecule;

    }

}

async function loadMapFromPath(commandCentre, glRef, dispatch, map_path, map_name, coord) {

    if (path && map_name) {

        const newMap = new MoorhenMap(commandCentre, glRef);
        console.log(map_path);
        console.log(map_name);
        const data = await window.electronAPI.getFileFromPath({ path: map_path });
        console.log(data);
        console.log('await load map...');
        await newMap.loadToCootFromMapData(data, map_name, false);
        newMap.isEM = false;
        if (!(coord == null)) {
            newMap.mapCentre = coord;
            console.log('await centre map...');

            await newMap.centreOnMap();
        }

        // Dispatch the new molecule to Moorhen
        console.log('await dispatch map...');
        await dispatch(addMap(newMap));

        console.log(`setting active map: ${newMap.molNo}`);
        await dispatch(setActiveMap(newMap));
    }

}

async function loadMTZFromPath(commandCentre, glRef, dispatch, map_path, map_name, coord) {

    if (path && map_name) {

        const newMap = new MoorhenMap(commandCentre, glRef);

        const data = await window.electronAPI.getFileFromPath({ path: map_path });
        console.log('await load map...');
        for (var index in structureFactors) {
            try {
                console.log(`Trying to open mtz with ${structureFactors[index].f} ${structureFactors[index].phi}`);
                const selectedColumns = { F: structureFactors[index].f, PHI: structureFactors[index].phi, Fobs: "FP", SigFobs: "SIGFP", FreeR: "FREE", isDifference: false, useWeight: false, calcStructFact: true }
                await newMap.loadToCootFromMtzData(data, map_name, selectedColumns);
                console.log(newMap);
                break;
            }
            catch (error) {
                console.log(error);
            }
        }
        // newMap.isEM = false;
        if (!(coord) == null) {
            newMap.mapCentre = coord;
            console.log('await centre map...');

            await newMap.centreOnMap();
        }

        // Dispatch the new molecule to Moorhen
        console.log('await dispatch map...');
        await dispatch(addMap(newMap));

        console.log(`setting active map: ${newMap.molNo}`);
        await dispatch(setActiveMap(newMap));
    }

}


async function updateData(dispatch) {
    dispatch(
        {
            'type': 'updateData',
        }
    );

}
async function updateSiteData(dispatch) {
    dispatch(
        {
            'type': 'updateSiteData',
        }
    );

}
async function saveData(pandda_inspect_state) {
    await window.electronAPI.saveData({ data: pandda_inspect_state.data });
}
async function saveSiteData(pandda_inspect_state) {
    await window.electronAPI.saveSiteData({ data: pandda_inspect_state.siteData });
}
async function removeMolJS(coot_dispatch, _mol) {
    console.log(`removing mol ${_mol.molNo}`);
    await coot_dispatch(hideMolecule({ molNo: _mol.molNo }));
    await coot_dispatch(removeMolecule(_mol));
}
async function removeMapJS(coot_dispatch, _map) {
    console.log(`removing map ${_map.molNo}`);
    await coot_dispatch(hideMap({ molNo: _map.molNo }));
    await coot_dispatch(removeMap(_map));
}

export async function loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state) {
    console.log('Loading molecule if possible...');
    console.log(pandda_inspect_state);

    if (cootInitialized && glRef.current && commandCentre.current) {
        console.log(molecules);
        console.log(maps);
        console.log('Awaiting delete molecules...');
        await molecules.moleculeList.map((_mol) => {
            removeMolJS(coot_dispatch, _mol);
        });
        console.log('Awaiting delete maps...');
        console.log(maps);
        await maps.map((_map) => {
            removeMapJS(coot_dispatch, _map);
        });

        let newMolecule;
        
        try {
            const mol_name = pandda_inspect_state.dtag;
            const mol_path = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, 'modelled_structures', `${pandda_inspect_state.dtag}-pandda-model.pdb`);
            console.log(`Loading mol from ${mol_path}`)
            console.log('Awaiting load molecule...');
            console.log(pandda_inspect_state.ligandFiles.get(mol_name));
            let newMolecule = await loadMoleculeFromPath(commandCentre, glRef, coot_dispatch, mol_path, mol_name, pandda_inspect_state.ligandFiles.get(mol_name));
        } catch (error) {
            const mol_name = pandda_inspect_state.dtag;
            const mol_path = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, `${pandda_inspect_state.dtag}-pandda-input.pdb`);
            console.log(`Loading mol from ${mol_path}`)
            console.log('Awaiting load molecule...');
            console.log(pandda_inspect_state.ligandFiles.get(mol_name));
            let newMolecule = await loadMoleculeFromPath(commandCentre, glRef, coot_dispatch, mol_path, mol_name, pandda_inspect_state.ligandFiles.get(mol_name));
        }


        try {
            const map_name = `${pandda_inspect_state.dtag}_${pandda_inspect_state.event_idx}`;
            const map_path = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, `${pandda_inspect_state.dtag}-event_${pandda_inspect_state.event_idx}_1-BDC_${pandda_inspect_state.bdc}_map.native.ccp4`);
            console.log(`Loading map from ${map_path}`)
            console.log('Awaiting load map...');
            console.log(`Centering ${[pandda_inspect_state.x, pandda_inspect_state.y, pandda_inspect_state.z]}`);
            console.log(`Loading: ${map_path} as ${map_name}`);
            await loadMapFromPath(commandCentre, glRef, coot_dispatch, map_path, map_name,
                [-pandda_inspect_state.x, -pandda_inspect_state.y, -pandda_inspect_state.z]);
        console.log('completed loading event data');
        } catch (error) { 
            console.log(error);
        }

        console.log('completed setting active map');

        dispatch(
            {
                'type': 'setActiveProteinMol',
                'val': newMolecule.molNo,
            }
        );
        dispatch(
            {
                'type': 'finishedLoading'
            }
        );
    }
}

async function saveModel(molecules, pandda_inspect_state) {
    const molPath = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, 'modelled_structures', `${pandda_inspect_state.dtag}-pandda-model.pdb`);
    const activeMol = molecules.moleculeList.filter((_mol) => { return _mol.molNo == pandda_inspect_state.activeProteinMol; })[0];
    const molPDB = await activeMol.getAtoms();
    console.log(`Saving model to: ${molPath}`);
    await window.electronAPI.saveModel(
        {
            path: molPath,
            pdb: molPDB,
        }
    );
}

async function loadNextLigand(dispatch, molecules, pandda_inspect_state) {
    const activeMol = molecules.moleculeList.filter((_mol) => { return _mol.molNo == pandda_inspect_state.activeProteinMol; })[0];

    if (pandda_inspect_state.activeLigandMol) {
        await activeMol.deleteCid(pandda_inspect_state.activeLigandMol);
        await activeMol.updateAtoms();
        await activeMol.updateLigands();
    }

    console.log('Adding ligand molecule...');
    console.log(pandda_inspect_state.activeProteinMol);
    console.log(molecules.moleculeList);

    const currentLigandCIDs = activeMol.ligands.map((_lig) => { return _lig.cid; });
    console.log(currentLigandCIDs);
    // await activeMol.transferLigandDicts(newMolecule);
    await activeMol.addLigandOfType('LIG', activeMol.molNo);
    await activeMol.updateLigands();
    console.log(activeMol);
    const newLigandCIDs = activeMol.ligands.map((_lig) => { return _lig.cid; });
    const activeLigandCID = newLigandCIDs.filter((_cid) => { return !currentLigandCIDs.includes(_cid); })[0];
    console.log(activeMol.ligands);
    console.log(activeLigandCID);

    dispatch(
        {
            'type': 'setActiveLigandMol',
            'val': activeLigandCID,
        }
    )
}

async function loadLigandAutobuild(glRef, commandCentre, molecules, coot_dispatch, dispatch, pandda_inspect_state) {
    console.log('Adding best autobuild...')
    // Get the active mol
    const activeMol = molecules.moleculeList.filter((_mol) => { return _mol.molNo == pandda_inspect_state.activeProteinMol; })[0];

    // Delete any active ligand mols
    if (pandda_inspect_state.activeLigandMol) {
        await activeMol.deleteCid(pandda_inspect_state.activeLigandMol);
        await activeMol.updateAtoms();
        await activeMol.updateLigands();
    }

    console.log('Adding autobuild ligand molecule...');
    console.log(pandda_inspect_state.activeProteinMol);
    console.log(molecules.moleculeList);

    // Get current CIDs for determining new ligand
    const currentLigandCIDs = activeMol.ligands.map((_lig) => { return _lig.cid; });
    console.log(currentLigandCIDs);

    // Load the best ligand autobuild as a new molecule
    const mol_path = path.join(
        pandda_inspect_state.args, 
        'processed_datasets', 
        pandda_inspect_state.dtag, 
        `${pandda_inspect_state.dtag}_event_${pandda_inspect_state.event_idx}_best_autobuild.pdb`);
    const mol_name = 'LIG';
    try {
        const newMol = await loadMoleculeFromPath(commandCentre, glRef, coot_dispatch, mol_path, mol_name, []);


    // Merge the molecule into the active mol
    console.log('Merging...')
    await activeMol.mergeMolecules([newMol]);
    await activeMol.updateLigands();

    // Delte the new mol
    console.log('Deleting used mol');
    await newMol.delete();

    //
    console.log(activeMol);
    const newLigandCIDs = activeMol.ligands.map((_lig) => { return _lig.cid; });
    const activeLigandCID = newLigandCIDs.filter((_cid) => { return !currentLigandCIDs.includes(_cid); })[0];
    console.log(activeMol.ligands);
    console.log(activeLigandCID);
    
    console.log('Dispatching active mol update...');
    dispatch(
        {
            'type': 'setActiveLigandMol',
            'val': activeLigandCID,
        }
    )
    } catch (error) {
        alert(error);
        return;
    }
}



export function handleSelectEvent(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('set event');
    console.log((event.target as HTMLInputElement).value);
    async function selectEvent() {
        let new_index = (event.target as HTMLInputElement).value;
        console.log(`Next event is ${new_index}...`);
        const nextEventData = tableIdxToEvent(new_index, pandda_inspect_state);

        dispatch(
            {
                type: 'handleSelectEvent',
                value: parseInt((event.target as HTMLInputElement).value)
            });
        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    selectEvent();
}
export function handleNextEvent(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    console.log('Select event');
    async function nextEvent() {
        const nextEventIdx = (pandda_inspect_state.table_idx + 1) % pandda_inspect_state.data.length;
        console.log(`Next event IDX: ${nextEventIdx}`);
        const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);
        console.log(nextEventData);

        await updateData(dispatch);
        await updateSiteData(dispatch);

        await saveData(pandda_inspect_state);
        await saveSiteData(pandda_inspect_state);

        await saveModel(molecules, pandda_inspect_state);
        console.log(pandda_inspect_state);


        await dispatch(
            {
                type: 'handleNextEvent',
                commandCentre: commandCentre,
                glRef: glRef
            });


        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    nextEvent();
    
}
export function handlePreviousEvent(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    async function previousEvent() {
    console.log('Select event');
    const nextEventIdx = ((pandda_inspect_state.table_idx - 1) % pandda_inspect_state.data.length) + pandda_inspect_state.data.length;
    console.log(`Next event IDX: ${nextEventIdx}`);
    const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);
    console.log(nextEventData);

    dispatch(
        {
            type: 'handlePreviousEvent',
            commandCentre: commandCentre,
            glRef: glRef
        });
        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    previousEvent();
}
export function handlePreviousSite(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading,) {
    async function previousSite() {

    const siteNums = pandda_inspect_state.data.map((_record) => { return _record.site_idx; });
    const highestSiteNum = Math.max(...siteNums);
    let newSite = ((pandda_inspect_state.site - 1) % highestSiteNum) + highestSiteNum;
    const siteRecords = pandda_inspect_state.data.filter((_record) => { return (_record.site_idx == newSite); });
    const siteIndexes = siteRecords.map((_record) => { return _record['']; });
    const nextEventIdx = Math.min(...siteIndexes);
    console.log({
        'siteNums': siteNums,
        'highestSiteNum':highestSiteNum,
        'siteRecords': siteRecords,
        'newSite': newSite,
        'siteIndexes': siteIndexes
    })
    console.log(`Next event IDX: ${nextEventIdx}`);
    const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);
    console.log(nextEventData);

    console.log('previous site');
    dispatch(
        {
            type: 'handlePreviousSite',
            commandCentre: commandCentre,
            glRef: glRef
        });
        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    previousSite();
}
export function handleNextSite(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    async function nextSite() {
        const siteNums = pandda_inspect_state.data.map((_record) => { return _record.site_idx; });
        const highestSiteNum = Math.max(...siteNums);
        let newSite = (pandda_inspect_state.site + 1) % highestSiteNum;
        const siteRecords = pandda_inspect_state.data.filter((_record) => { return (_record.site_idx == newSite); });
        const siteIndexes = siteRecords.map((_record) => { return _record['']; });
        const nextEventIdx = Math.min(...siteIndexes);
        
        console.log(`(effect) Next event IDX: ${nextEventIdx}`);
        const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);
        console.log(nextEventData);
        console.log('Next site');
        dispatch(
            {
                type: 'handleNextSite',
                commandCentre: commandCentre,
                glRef: glRef
            });
        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    nextSite();
}
export function handleNextUnviewed(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    async function nextUnviewed() {

    console.log('Select event unviewed');
    const nextUnviewedEvents = pandda_inspect_state.data.filter((_record) => {
        return ((!_record['Viewed']) && (_record[''] > pandda_inspect_state.table_idx));
    }
    );
    console.log(nextUnviewedEvents);
    if (nextUnviewedEvents.length == 0) {
        alert('No unviwed events of higher number remain!');
        setIsLoading(false);
        return;
    } 

    const nextEventIdx = nextUnviewedEvents[0][''];
    const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);

    dispatch(
        {
            type: 'handleNextUnviewed',
            commandCentre: commandCentre,
            glRef: glRef
        });
    await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
    setIsLoading(false);
    }
    nextUnviewed();
}
export function handleNextUnmodelled(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    async function nextUnmodelled() {

        const data = pandda_inspect_state.data
        console.log(data);

        const nextUnviewedEvents = data.filter((_record) => {
            return ((!_record['Ligand Placed']) && (_record[''] > pandda_inspect_state.table_idx));
        }
        );
        console.log(nextUnviewedEvents);

    if (nextUnviewedEvents.length == 0) {
        alert('No unmodelled events of higher number remain!');
        setIsLoading(false);
        return;
    }
    const nextEventIdx = nextUnviewedEvents[0][''];
    const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);

    console.log('Select event unmodelled');
    dispatch(
        {
            type: 'handleNextUnmodelled',
            commandCentre: commandCentre,
            glRef: glRef
        });
    await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
    setIsLoading(false);
    }
    nextUnmodelled();
}
export function handleNextEventDontSave(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state, setIsLoading) {
    async function nextEventDontSave() {
        const nextEventIdx = (pandda_inspect_state.table_idx + 1) % pandda_inspect_state.data.length;
        console.log(`Next event IDX: ${nextEventIdx}`);
        const nextEventData = tableIdxToEvent(nextEventIdx, pandda_inspect_state);
        console.log(nextEventData);

        console.log('Select next event without saving');
        dispatch(
            {
                type: 'handleNextEventDontSave',
                commandCentre: commandCentre,
                glRef: glRef
            });
        await loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, nextEventData);
        setIsLoading(false);
    }
    nextEventDontSave();
}

export function handleMergeLigand(glRef, commandCentre, dispatch) {
    console.log('Select event');
    dispatch(
        {
            type: 'handleMergeLigand',
            commandCentre: commandCentre,
            glRef: glRef
        });
}
export function handleMoveLigand() {
    alert('Not Implemented!');
}
export function handleNextLigand(dispatch, molecules, pandda_inspect_state) {
    loadNextLigand(dispatch, molecules, pandda_inspect_state);
}
export function handleLoadLigandAutobuild(glRef, commandCentre, molecules, coot_dispatch, dispatch, pandda_inspect_state) {
    loadLigandAutobuild(glRef, commandCentre, molecules, coot_dispatch, dispatch, pandda_inspect_state);
}
export function handleSaveLigand(molecules, pandda_inspect_state) {
    console.log('Save event');
    saveModel(molecules, pandda_inspect_state)
}
export function handleReloadLigand(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state) {
    console.log('Select event');
    loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state);
}
export function handleResetLigand() {
    alert('Not implemented!');
}

export function handleSetEventComment(dispatch, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('Set event comment...');
    async function setEventComment() {
        dispatch(
            {
                type: 'handleSetEventComment',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

    }
    setEventComment();
}
export function handleSetInteresting(dispatch, pandda_inspect_state, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('Select event');
    async function setInteresting() {
        dispatch(
            {
                type: 'handleSetInteresting',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

        await saveData(pandda_inspect_state);
        await saveSiteData(pandda_inspect_state);

    }
    setInteresting();
}
export function handleSetPlaced(dispatch, pandda_inspect_state, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('Select event');
    async function setPlaced() {
        dispatch(
            {
                type: 'handleSetPlaced',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

        await saveData(pandda_inspect_state);
        await saveSiteData(pandda_inspect_state);

    }
    setPlaced();
}
export function handleSetConfidence(dispatch, pandda_inspect_state, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('set confidence');
    console.log((event.target as HTMLInputElement).value);
    async function setConfidence() {
        dispatch(
            {
                type: 'handleSetConfidence',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

        await saveData(pandda_inspect_state);
        await saveSiteData(pandda_inspect_state);

    }
    setConfidence();
}
export function handleSetSiteName(dispatch, pandda_inspect_state, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('Setting site name...');
    async function setSiteName() {
        dispatch(
            {
                type: 'handleSetSiteName',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

        // await saveData();
    }
    setSiteName();
}
export function handleSetSiteComment(dispatch, pandda_inspect_state, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('Setting site comment...');
    async function setSiteComment() {
        dispatch(
            {
                type: 'handleSetSiteComment',
                value: (event.target as HTMLInputElement).value
            });
        await updateData(dispatch);
        await updateSiteData(dispatch);

    }
    setSiteComment();
}

export function handleLoadInputMTZ(glRef, commandCentre, coot_dispatch, pandda_inspect_state,) {
    console.log('Loading input mtz...');
    const molName = pandda_inspect_state.dtag;
    const molPath = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, `${pandda_inspect_state.dtag}-pandda-input.mtz`);
    console.log(`Loading comparison mol from: ${molPath}`);
    loadMTZFromPath(commandCentre, glRef, coot_dispatch, molPath, molName, null);
}

export function handleLoadGroundState(glRef, commandCentre, coot_dispatch, pandda_inspect_state) {
    console.log('Loading ground state map...');
    const molName = `${pandda_inspect_state.dtag}_ground_state`;
    const mapPath = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, `${pandda_inspect_state.dtag}-ground-state-average-map.native.ccp4`);
    console.log(`Loading ground state map from: ${mapPath}`);
    loadMapFromPath(commandCentre, glRef, coot_dispatch, mapPath, molName, null);
}
export function handleLoadInputStructure(glRef, commandCentre, coot_dispatch, pandda_inspect_state) {
    console.log('Loading input structure...');
    const molName = pandda_inspect_state.dtag;
    const molPath = path.join(pandda_inspect_state.args, 'processed_datasets', pandda_inspect_state.dtag, `${pandda_inspect_state.dtag}-pandda-input.pdb`);
    console.log(`Loading comparison mol from: ${molPath}`);
    loadMoleculeFromPath(commandCentre, glRef, coot_dispatch, molPath, molName, pandda_inspect_state.ligandFiles.get(molName));
}
export function handleCreateNewLigand() {
    alert('Not implemented!');
}

function handleSetInitialData(dispatch, df) {
    dispatch(
        {
            type: 'handleSetInitialData',
            df: df
        });
}

function handleSetInitialSiteData(dispatch, df) {
    dispatch(
        {
            type: 'handleSetInitialSiteData',
            df: df
        });
}

export async function getData(dispatch, pandda_inspect_state) {
    console.log('In effect to get data');
    const get_data = async function () {
        const df = await window.electronAPI.data();
        handleSetInitialData(dispatch, df)
    };
    if (pandda_inspect_state.data.length == 0) {
        console.log('Getting data...');
        get_data();
        console.log('got data');
    }
}


export async function getSiteData(dispatch, pandda_inspect_state) {
    console.log('In effect to get data');
    const get_data = async function () {
        const df = await window.electronAPI.getSiteData();
        handleSetInitialSiteData(dispatch, df)
    };
    if (pandda_inspect_state.data.length == 0) {
        console.log('Getting data...');
        get_data();
        console.log('got data');
    }
}

export async function getLigandFiles(dispatch, pandda_inspect_state) {
    if (pandda_inspect_state.ligandFiles.size == 0) {
        const ligandFiles = await window.electronAPI.getLigandPaths();
        console.log(ligandFiles);
        dispatch({ type: 'handleGetLigandFiles', ligandFiles: ligandFiles });
    };

}

export async function handleGetArgs(dispatch, pandda_inspect_state) {
    if (pandda_inspect_state.data.length == 0) {
        const args = await window.electronAPI.args();
        dispatch(
            {
                type: 'handleGetArgs',
                args: args
            });
    }
}