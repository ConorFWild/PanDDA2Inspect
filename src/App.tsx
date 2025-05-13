import { useRef, useEffect } from 'react';
import { MoorhenContainer, MoorhenReduxStore } from 'moorhen';
import { Provider } from 'react-redux';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import { useImmerReducer } from 'use-immer';

import './App.css';
import './moorhen.css';

import { PanDDAInspectEventHandlers } from './PanDDAInspectTypes';
import { initialPanDDAInspectState } from './PanDDA2Constants';

import { PanDDAInspect } from './PanDDAInspect';
import { panDDAInspectReducer } from './PanDDAInspectReducer'
import {
  handleSelectEvent,
  handleNextEvent,
  handlePreviousEvent,
  handlePreviousSite,
  handleNextSite,
  handleNextUnviewed,
  handleNextUnmodelled,
  handleNextEventDontSave,
  handleMergeLigand,
  handleMoveLigand,
  handleNextLigand,
  handleLoadLigandAutobuild,
  handleSaveLigand,
  handleReloadLigand,
  handleResetLigand,
  handleSetEventComment,
  handleSetInteresting,
  handleSetPlaced,
  handleSetConfidence,
  handleSetSiteName,
  handleSetSiteComment,
  handleLoadInputMTZ,
  handleLoadGroundState,
  handleLoadInputStructure,
  handleCreateNewLigand,
  getLigandFiles,
  getData,
  getSiteData,
  handleGetArgs,
  loadEventData
} from './PanDDAInspectEffects'


const MyMoorhenContainer = (props) => {

  const setDimensions = () => {
    return [Math.ceil(window.innerWidth * 0.8), window.innerHeight]
  }

  return <MoorhenContainer
    setMoorhenDimensions={setDimensions}
    {...props}
  />
}

function MoorhenController() {
  // Moorhen wrapper containing pandda inspect controls
  console.log(initialPanDDAInspectState);

  // Core react state
  const [pandda_inspect_state, dispatch] = useImmerReducer(panDDAInspectReducer, initialPanDDAInspectState);

  // Effect to get arguments to electron app
  useEffect(
    () => {
      handleGetArgs(dispatch, pandda_inspect_state);
    }, []
  )

  // Effect to get ligand information
  useEffect(
    () => {
      getLigandFiles(dispatch, pandda_inspect_state);
    }, []
  )

  // Effect to get pandda table data
  useEffect(
    () => {
      getData(dispatch, pandda_inspect_state);
    }, []
  )

  // Effect to get pandda site table data
  useEffect(
    () => {
      getSiteData(dispatch, pandda_inspect_state);
    }, []
  )

  console.log('pandda inspect data');
  console.log(pandda_inspect_state.data);

  const glRef = useRef(null);
  const timeCapsuleRef = useRef(null);
  const commandCentre = useRef(null);
  const moleculesRef = useRef(null);
  const mapsRef = useRef(null);
  const collectedProps = {
    glRef, timeCapsuleRef, commandCentre, moleculesRef, mapsRef,
  };
  const cootInitialized = useSelector((coot_state: any) => coot_state.generalStates.cootInitialized);
  const molecules = useSelector((state: any) => state.molecules);
  const maps = useSelector((state: any) => state.maps);
  const coot_dispatch = useDispatch();


  const pandda_inspect_event_handlers: PanDDAInspectEventHandlers = {
    handleSelectEvent: (event) => { handleSelectEvent(dispatch, event) },
    handleNextEvent: () => { handleNextEvent(glRef, commandCentre, molecules, dispatch, pandda_inspect_state) },
    handlePreviousEvent: () => { handlePreviousEvent(glRef, commandCentre, dispatch) },
    handlePreviousSite: () => { handlePreviousSite(glRef, commandCentre, dispatch) },
    handleNextSite: () => { handleNextSite(glRef, commandCentre, dispatch) },
    handleNextUnviewed: () => { handleNextUnviewed(glRef, commandCentre, dispatch) },
    handleNextUnmodelled: () => { handleNextUnmodelled(glRef, commandCentre, dispatch) },
    handleNextEventDontSave: () => { handleNextEventDontSave(glRef, commandCentre, dispatch) },

    handleMergeLigand: () => { handleMergeLigand(glRef, commandCentre, dispatch) },
    handleMoveLigand: () => { handleMoveLigand() },
    handleNextLigand: () => { handleNextLigand(dispatch, molecules, pandda_inspect_state) },
    handleLoadLigandAutobuild: () => {handleLoadLigandAutobuild(glRef, commandCentre, molecules, coot_dispatch, dispatch, pandda_inspect_state)},
    handleSaveLigand: () => { handleSaveLigand(molecules, pandda_inspect_state) },
    handleReloadLigand: () => { handleReloadLigand(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state) },
    handleResetLigand: () => { handleResetLigand() },

    handleSetEventComment: (event) => { handleSetEventComment(dispatch, event) },
    handleSetInteresting: (event) => { handleSetInteresting(dispatch, pandda_inspect_state, event) },
    handleSetPlaced: (event) => { handleSetPlaced(dispatch, pandda_inspect_state, event) },
    handleSetConfidence: (event) => { handleSetConfidence(dispatch, pandda_inspect_state, event) },
    handleSetSiteName: (event) => { handleSetSiteName(dispatch, pandda_inspect_state, event) },
    handleSetSiteComment: (event) => { handleSetSiteComment(dispatch, pandda_inspect_state, event) },

    handleLoadInputMTZ: () => { handleLoadInputMTZ(glRef, commandCentre, coot_dispatch, pandda_inspect_state) },
    handleLoadGroundState: () => { handleLoadGroundState(glRef, commandCentre, coot_dispatch, pandda_inspect_state) },
    handleLoadInputStructure: () => { handleLoadInputStructure(glRef, commandCentre, coot_dispatch, pandda_inspect_state) },
    handleCreateNewLigand: () => { handleCreateNewLigand() },
  };

  // Effect to load events
  useEffect(
    () => {
      loadEventData(cootInitialized, glRef, commandCentre, molecules, maps, coot_dispatch, dispatch, pandda_inspect_state);
    },
    [cootInitialized, pandda_inspect_state.table_idx, pandda_inspect_state.ligandFiles]
  )


  console.log('Getting initial pandda inspect state');
  console.log(pandda_inspect_state);

  console.log('Getting initial pandda handlers');
  console.log(pandda_inspect_event_handlers);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={0} columns={10}>
        <Grid size={8}>
          <MyMoorhenContainer {...collectedProps} />
        </Grid>
        <Grid size={2}>
          <PanDDAInspect
            state={pandda_inspect_state}
            handlers={pandda_inspect_event_handlers}
          ></PanDDAInspect>

        </Grid>
      </Grid>

    </Box>
  );

}

function App() {

  return (
    <div className="App">
      <Provider store={MoorhenReduxStore}>
        <MoorhenController></MoorhenController>
      </Provider>

    </div>
  );
}

export default App;


