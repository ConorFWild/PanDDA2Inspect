import { original, current } from 'immer';

function updateEvent(draft, record) {
    console.log('Updating record...');
    console.log(record);
    draft.dtag = record.dtag;
    draft.event_idx = record.event_idx;

    draft.site = record.site_idx;
    draft.bdc = record['1-BDC'];
    draft.x = record.x;
    draft.y = record.y;
    draft.z = record.z;
    draft.z_blob_peak = record.z_peak;
    draft.z_blob_size = record.cluster_size;
    draft.resolution = record.high_resolution;
    draft.map_uncertainty = record.map_uncertainty;
    draft.r_work = record.r_work;
    draft.r_free = record.r_free;

    draft.event_comment = record['Comment'];
    draft.event_interesting = record['Interesting'];
    draft.ligand_placed = record['Ligand Placed'];
    draft.ligand_confidence = record['Ligand Confidence'];
    draft.site_name = record['Site Name'];
    draft.site_comment = record['Site Comment'];
}


export function panDDAInspectReducer(draft, action) {
    switch (action.type) {

        case 'handleSetInitialData': {
            console.log('Setting initial data');
            draft.data = action.df;
            const record = action.df[0];
            updateEvent(draft, record);
            console.log('Set initial data');
            break;
        }
        case 'handleGetArgs': {
            console.log('Setting args');
            draft.args = action.args;
            console.log('Set args');
            break;
        }
        case 'handleGetLigandFiles': {
            console.log('getting ligand files');
            draft.ligandFiles = action.ligandFiles;
            console.log('set ligand files');
            break;
        }
        case 'setActiveProteinMol': {
            console.log(`setting active protein mol to: ${action.val}`);
            draft.activeProteinMol = action.val;
            console.log('set active protein mol');
            break;
        }
        case 'setActiveLigandMol': {
            console.log(`setting active ligand mol to: ${action.val}`);
            draft.activeLigandMol = action.val;
            console.log('set active ligand mol');
            break;
        }
        case 'updateData': {
            console.log('Updating data in working table...')
            draft.data[draft.table_idx]['Comment'] = draft.event_comment;
            draft.data[draft.table_idx]['Interesting'] = draft.event_interesting;
            draft.data[draft.table_idx]['Ligand Placed'] = draft.ligand_placed;
            draft.data[draft.table_idx]['Ligand Confidence'] = draft.ligand_confidence;
            draft.data[draft.table_idx]['Site Name'] = draft.site_name;
            draft.data[draft.table_idx]['Site Comment'] = draft.site_comment;
            console.log('Updated!')
            console.log(current(draft.data[draft.table_idx]));
            break;
        }

        // Event control
        case 'handleSelectEvent': {
            console.log(`Selecting event...`);
            let new_index = action.value;
            console.log(`Next event is ${new_index}...`);
            draft.table_idx = new_index;
            const record = draft.data[new_index];
            updateEvent(draft, record);
            break;
        }
        case 'handleNextEvent': {
            console.log(`Next event from ${draft.table_idx}...`);
            let new_index = 0;
            if (draft.table_idx == (draft.data.length - 1)) {
                new_index = 0;
            } else {
                new_index = draft.table_idx + 1;
            }
            console.log(`Next event is ${new_index}...`);

            draft.table_idx = new_index;
            const record = draft.data[new_index];
            updateEvent(draft, record);
            break;
        }
        case 'handlePreviousEvent': {
            console.log(`Previous event from ${draft.table_idx}...`);
            let new_index = 0;
            if (draft.table_idx == 0) {
                new_index = (draft.data.length - 1);
            } else {
                new_index = draft.table_idx - 1;
            }
            console.log(`Previous event is ${new_index}...`);

            draft.table_idx = new_index;
            const record = draft.data[new_index];
            updateEvent(draft, record);
            break;
        }
        case 'handleLoadEvent': {
            console.log('Loading Event');
            console.log(action);
            if (action.data.length == 0) {
                break;
            }
            else {
                draft.table_idx = action.idx;
                console.log(action.data)
                const record = action.data[action.idx];
                updateEvent(draft, record);
                console.log('Loaded initial Event');
                break;
            }
        }
        case 'handleNextSite': {
            const siteNums = draft.data.map((_record) => { return _record.site_idx; });
            console.log(siteNums);
            const highestSiteNum = Math.max(...siteNums);
            console.log(highestSiteNum);
            let newSite = 0;
            if (draft.site == highestSiteNum) {
                newSite = 0;
            } else {
                newSite = draft.site + 1;
            }
            console.log(original(draft.data));
            const siteRecords = draft.data.filter((_record) => { return (_record.site_idx == newSite); });
            console.log(siteRecords);
            const siteIndexes = siteRecords.map((_record) => { return _record['']; });
            console.log(siteIndexes);
            const lowestTableNumInSite = Math.min(...siteIndexes);
            console.log(`New index is: ${lowestTableNumInSite}...`);
            draft.table_idx = lowestTableNumInSite;
            const record = draft.data[lowestTableNumInSite];
            updateEvent(draft, record);
            break;
        }
        case 'handlePreviousSite': {
            const siteNums = draft.data.map((_record) => { return _record.site_idx; });
            const highestSiteNum = Math.max(...siteNums);
            let newSite = 0;
            if (draft.site == 0) {
                newSite = highestSiteNum;
            } else {
                newSite = draft.site - 1;
            }
            const siteRecords = draft.data.filter((_record) => { return (_record.site_idx == newSite); });
            console.log(siteRecords);
            const siteIndexes = siteRecords.map((_record) => { return _record['']; });
            console.log(siteIndexes);
            const lowestTableNumInSite = Math.min(...siteIndexes);
            console.log(`New index is: ${lowestTableNumInSite}...`);
            draft.table_idx = lowestTableNumInSite;
            const record = draft.data[lowestTableNumInSite];
            updateEvent(draft, record);
            break;
        }
        case 'handleNextUnviewed': {
            const data = original(draft.data);
            console.log(data);
            // console.log(original(draft.table_idx));
            const nextUnviewedEvents = data.filter((_record) => {
                return ((!_record['Viewed']) && (_record[''] > draft.table_idx));
            }
            );
            console.log(nextUnviewedEvents);
            if (nextUnviewedEvents.length == 0) {
                alert('No unviwed events of higher number remain!');
            } else {
                const newRecordIDX = nextUnviewedEvents[0][''];
                console.log(`New index is: ${newRecordIDX}...`);
                draft.table_idx = newRecordIDX;
                const record = data[newRecordIDX];
                updateEvent(draft, record);
            }
            break;
        }
        case 'handleNextUnmodelled': {
            const data = original(draft.data)
            console.log(data);

            const nextUnviewedEvents = draft.data.filter((_record) => {
                return ((!_record['Ligand Placed']) && (_record[''] > draft.table_idx));
            }
            );
            console.log(nextUnviewedEvents);

            if (nextUnviewedEvents.length == 0) {
                alert('No unmodelled events of higher number remain!');
            } else {
                const newRecordIDX = nextUnviewedEvents[0][''];
                console.log(`New index is: ${newRecordIDX}...`);
                draft.table_idx = newRecordIDX;
                const record = draft.data[newRecordIDX];
                updateEvent(draft, record);
            }
            break;
        }
        case 'handleNextEventDontSave': {

            console.log(`Next event from ${draft.table_idx}...`);
            let new_index = 0;
            if (draft.table_idx == (draft.data.length - 1)) {
                new_index = 0;
            } else {
                new_index = draft.table_idx + 1;
            }
            console.log(`Next event is ${new_index}...`);

            draft.table_idx = new_index;
            const record = draft.data[new_index];
            updateEvent(draft, record);
            break;
        }
        case 'handleMergeLigand': {

            console.log(`Merging ligand...`);
            draft.activeLigandMol = null;
            alert('Ligand merged!');
            break;
        }
        case 'handleSaveLigand': {
            console.log(`Saving model...`);
            alert('Ligand saved!');
            break;
        }

        // Model control


        // Annotation
        case 'handleSetEventComment': {

            if ((typeof action.value) != undefined) {

                draft.event_comment = action.value;
            }
            break;
        }

        // handleSetInteresting
        case 'handleSetInteresting': {
            if ((typeof action.value) != undefined) {

                draft.event_interesting = action.value;
            }
            break;
        }
        // handleSetPlaced
        case 'handleSetPlaced': {
            if ((typeof action.value) != undefined) {

                draft.ligand_placed = action.value;
            }
            break;
        }
        // handleSetConfidence
        case 'handleSetConfidence': {
            if ((typeof action.value) != undefined) {

                draft.ligand_confidence = action.value;
            }
            break;
        }
        // handleSetSiteName
        case 'handleSetSiteName': {
            if ((typeof action.value) != undefined) {

                draft.site_name = action.value;
            }
            break;
        }
        // handleSetSiteComment
        case 'handleSetSiteComment': {
            if ((typeof action.value) != undefined) {
                draft.site_comment = action.value;
            }
            break;
        }

        // Misc
        //handleLoadInputMTZ
        //handleLoadGroundState
        //handleLoadInputStructure
        //handleCreateNewLigand
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}