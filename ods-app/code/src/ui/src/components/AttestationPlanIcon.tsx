/**
 * Copyright (c) 2025 Capital One
*/

import React from 'react';
import HelpIcon from '@mui/icons-material/Help';
import ReportIcon from '@mui/icons-material/Report';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import CancelIcon from '@mui/icons-material/Cancel';

interface Props {
    state: string;
}

const AttestationPlanIcon: React.FC<Props> = ({ state }) => {
    if (state == "created" || state == "active") {
        return <StopCircleIcon sx={{ color: "grey" }} />
    }
    else if (state == "rejected") {
        return <ReportIcon color="error" />
    }
    else if (state == "pending") {
        return <ChangeCircleIcon color="info" />
    }
    else if (state == "complete") {
        return <CheckCircleIcon color="success" />
    }
    else if (state == "overdue") {
        return <WarningAmberRoundedIcon sx={{backgroundColor:"#FDC630", borderRadius:"50%"}} />
    }
    else if (state == "deferred") {
        return <DoDisturbOnRoundedIcon color="error" />
    }
    else if (state == "cancelled") {
        return <CancelIcon sx={{ color: "grey" }} />
    }
    return <HelpIcon sx={{ color: "grey" }} />
}

export default AttestationPlanIcon;
