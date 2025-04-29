import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material'

import { theme } from './PanDDA2Constants';
import { EventInteresting, LigandPlaced, LigandConfidence } from './PanDDAInspectTypes';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

const PanDDAInspectDatasetInfo = ({ state }) => {
    console.log('dataset info in component');
    console.log(state);
    return (
        <div>
            <Stack spacing={0}>
                <Item>Dtag: {state.dtag}</Item>
                <Item>Resolution: {state.resolution}</Item>
                <Item>Map Unvertainty: {state.map_uncertainty}</Item>
                <Item>R-Free / R-Work: {state.r_free} / {state.r_work}</Item>

            </Stack>
        </div>
    )
}

const PanDDAInspectEventInfo = ({ state }) => {
    return (
        <div>
            <Stack spacing={0}>
                <Item>Event Number: {state.event_idx}</Item>
                <Item>Site Number: {state.site}</Item>
                <Item>1-BDC: {state.bdc}</Item>
                <Item>Z-blob Peak: {state.z_blob_peak}</Item>
                <Item>Z-blob Size: {state.z_blob_size} </Item>

            </Stack>
        </div>
    )
}

const PanDDAInspectSummary = ({ state }) => {
    return (
        <div>
            <Box sx={{
                flexGrow: 1,
                //height: window.innerHeight * 0.1
            }}>
                <Grid container spacing={0} columns={2}>
                    <Grid size={1}>
                        <PanDDAInspectDatasetInfo state={state}></PanDDAInspectDatasetInfo>
                    </Grid>
                    <Grid size={1}>
                        <PanDDAInspectEventInfo state={state}></PanDDAInspectEventInfo>
                    </Grid>

                </Grid>

            </Box>
        </div>
    );

}

const buttonStyle = {
    height: '100%'
} as const;


const PanDDAInspectDatasetControl = ({ state, handlers }) => {

    console.log('In Dataset control');
    console.log(handlers);

    const selectItems = state.data.map((record) =>
        <MenuItem value={record['']}>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={0} columns={3}>
                    <Grid size={2}>
                        {record.dtag} {record.event_idx}
                    </Grid>
                    <Grid size={1}>
                        <Typography variant="inherit" align='right'>Site: {record.site_idx}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </MenuItem>
    );

    return (
        <Box sx={{
            //height: window.innerHeight * 0.3 
        }}>
            <div>
                <Item>Dataset Control</Item>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Select Event</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        // value={age}
                        label="Age"
                        onChange={handlers.handleSelectEvent}
                    >
                        {selectItems}
                    </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={0} columns={2}>
                        <Grid size={1}>
                            <Button
                                sx={buttonStyle}
                                onClick={handlers.handlePreviousEvent}
                            >Previous Event</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button
                                sx={buttonStyle}
                                onClick={handlers.handleNextEvent}
                            >Next Event</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button sx={buttonStyle} onClick={handlers.handlePreviousSite}>Previous Site</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button sx={buttonStyle} onClick={handlers.handleNextSite}>Next Site</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button sx={buttonStyle} onClick={handlers.handleNextUnviewed}>Next Unviewed</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button sx={buttonStyle} onClick={handlers.handleNextUnmodelled}>Next Unmodelled</Button>
                        </Grid>
                        <Grid size={1}>
                            <Button sx={buttonStyle} onClick={handlers.handleNextEventDontSave}>Next Event (Don't Save)</Button>
                        </Grid>
                        {/* <Grid size={1}>
              <Button>Select Event</Button>
            </Grid> */}
                    </Grid>

                </Box>
            </div>
        </Box>
    );
}


const PanDDAInspectModellingControl = ({ state, handlers }) => {
    return (
        <div>
            <Item>Modelling Control</Item>
            <Box sx={{
                flexGrow: 1,
                // height: window.innerHeight * 0.2
            }}>
                <Grid container spacing={0} columns={2}>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleMergeLigand}>Merge Model With Model</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleMoveLigand}>Move Ligand Here</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleNextLigand}>Open Next Ligand</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleSaveLigand}>Save Model</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleReloadLigand}>Reload Last Saved Model</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleResetLigand}>Reset To Unfitted Model</Button>
                    </Grid>


                </Grid>

            </Box>
        </div>
    );
}




const PanDDAInspectAnnotation = ({ state, handlers }) => {
    console.log('In inspect annotation');
    console.log(state);

    return (
        <Box sx={{
            // height: window.innerHeight * 0.3 
        }}>
            <div>
                <Item>Annotation Control</Item>
                <TextField
                    id="filled-basic"
                    label="Event Comment"
                    variant="filled"
                    value={state.event_comment}
                    onChange={handlers.handleSetEventComment}
                />
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Event Interesting</FormLabel>
                    <RadioGroup
                        row
                        onChange={handlers.handleSetInteresting}
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={state.event_interesting}
                        name="radio-buttons-group"
                    >
                        <FormControlLabel value={EventInteresting.No} control={<Radio />} label="Not Interesting" />
                        <FormControlLabel value={EventInteresting.Yes} control={<Radio />} label="Interesting" />
                    </RadioGroup>
                </FormControl>

                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Ligand Placed</FormLabel>
                    <RadioGroup
                        row
                        onChange={handlers.handleSetPlaced}
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={state.ligand_placed}
                        name="radio-buttons-group"
                    >
                        <FormControlLabel value={LigandPlaced.No} control={<Radio />} label="Ligand Not Placed" />
                        <FormControlLabel value={LigandPlaced.Yes} control={<Radio />} label="Ligand Placed" />
                    </RadioGroup>
                </FormControl>

                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Ligand Confidence</FormLabel>
                    <RadioGroup
                        row
                        onChange={handlers.handleSetConfidence}
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={state.ligand_confidence}
                        name="radio-buttons-group"
                    >
                        <FormControlLabel value={LigandConfidence.Low} control={<Radio />} label="Low" />
                        <FormControlLabel value={LigandConfidence.Medium} control={<Radio />} label="Medium" />
                        <FormControlLabel value={LigandConfidence.High} control={<Radio />} label="High" />
                    </RadioGroup>
                </FormControl>

                <TextField id="filled-basic" label="Site Name" variant="filled"
                    value={state.site_name}
                    onChange={handlers.handleSetSiteName} />
                <TextField id="filled-basic" label="Site Comment" variant="filled"
                    value={state.site_comment}
                    onChange={handlers.handleSetSiteComment} />
            </div>
        </Box>
    );
}

const PanDDAInspectMisc = ({ state, handlers }) => {
    return (
        <div>
            <Item>Misc Control</Item>
            <Box sx={{
                flexGrow: 1,
                // height: window.innerHeight * 0.1 
            }}>
                <Grid container spacing={0} columns={2}>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleLoadInputMTZ}>Load Input Mtz</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleLoadGroundState}>Load Ground State</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleLoadInputStructure}>Load input Structure</Button>
                    </Grid>
                    <Grid size={1}>
                        <Button sx={buttonStyle} onClick={handlers.handleCreateNewLigand}>Create new ligand</Button>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}




export const PanDDAInspect = ({ state, handlers }) => {

    console.log('In panDDA Inspect');
    console.log(handlers);

    return (
        <ThemeProvider theme={theme}>
            <Box >
                <div>
                    <PanDDAInspectSummary state={state}></PanDDAInspectSummary>
                    <PanDDAInspectDatasetControl state={state} handlers={handlers}></PanDDAInspectDatasetControl>
                    <PanDDAInspectModellingControl state={state} handlers={handlers}></PanDDAInspectModellingControl>
                    <PanDDAInspectAnnotation state={state} handlers={handlers}></PanDDAInspectAnnotation>
                    <PanDDAInspectMisc state={state} handlers={handlers}></PanDDAInspectMisc>
                </div>
            </Box>
        </ThemeProvider>
    );

}