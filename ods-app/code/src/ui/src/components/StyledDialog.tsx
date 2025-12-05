/**
 * Copyright (c) 2025 Capital One
*/

import { styled } from '@mui/material';
import { SimpleDialog } from './SimpleDialog';


const StyledDialog = styled(SimpleDialog)(({ theme }) => ({
    "& .MuiLink-button": {
      backgroundColor: "var(--white) !important",
      color: "var(--on-white) !important",
    },
    "& .MuiIconButton-root": {
        backgroundColor: "var(--white) !important",
        color: "var(--on-white) !important",
      },
      "& .MuiDialog-paper": {
          overflowY: "visible",
      },
    }));

export default StyledDialog
