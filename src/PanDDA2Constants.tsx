import { createTheme } from '@mui/material'


export const theme = createTheme({
    spacing: 4,
    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontSize: 10,
    },
});