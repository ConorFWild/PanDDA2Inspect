
export const EventInteresting = {
  No: 'False',
  Yes: 'True',
} as const;
type EventInterestingType = typeof EventInteresting[keyof typeof EventInteresting];


export const LigandPlaced = {
  No: 'False',
  Yes: 'True',
} as const;
type LigandPlacedType = typeof LigandPlaced[keyof typeof LigandPlaced];


export const LigandConfidence = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
} as const;
type LigandConfidenceType = typeof LigandConfidence[keyof typeof LigandConfidence];



export type PanDDAInspectState = {
  table_idx: number;
  dtag: string;
  event_idx: number;
  site: number;
  bdc: number;
  x: number;
  y: number;
  z: number;
  z_blob_peak: number;
  z_blob_size: number;
  resolution: number;
  map_uncertainty: number;
  r_work: number;
  r_free: number;
  event_comment: string;
  event_interesting: EventInterestingType;
  ligand_placed: LigandPlacedType;
  ligand_confidence: LigandConfidenceType;
  site_name: string;
  site_comment: string;
  data: any;
  siteData: any;
  args: any;
  ligandFiles: any;
  activeProteinMol: any;
  activeLigandMol: any;
};


export type PanDDAInspectEventHandlers = {
  handleSelectEvent: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleNextEvent: () => void,
  handlePreviousEvent: () => void,
  handlePreviousSite: () => void,
  handleNextSite: () => void,
  handleNextUnviewed: () => void,
  handleNextUnmodelled: () => void,
  handleNextEventDontSave: () => void,

  handleMergeLigand: () => void,
  handleMoveLigand: () => void,
  handleNextLigand: () => void,
  handleLoadLigandAutobuild: () => void,
  handleSaveLigand: () => void,
  handleReloadLigand: () => void,
  handleResetLigand: () => void,

  handleSetEventComment: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSetInteresting: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSetPlaced: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSetConfidence: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSetSiteName: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSetSiteComment: (event: React.ChangeEvent<HTMLInputElement>) => void,

  handleLoadInputMTZ: () => void,
  handleLoadGroundState: () => void,
  handleLoadInputStructure: () => void,
  handleCreateNewLigand: () => void,

}