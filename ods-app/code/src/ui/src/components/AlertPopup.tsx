/**
 * Copyright (c) 2025 Capital One
*/

import React, { ReactNode } from 'react';
import StyledDialog from './StyledDialog';

export interface AlertPopupSettings {
    noLabel?: string;               // Label for the negative (No) button
    yesLabel?: string;              // Label for the positive (Yes) button
    title?: ReactNode | string;     // Title of the dialog
    text?: ReactNode | string;      // Text of the dialog
    yesCallback?: (data: AlertPopupSettings) => void ;          // Callback function if positive button clicked
    noCallback?: (data: AlertPopupSettings) => void;            // Callback function if negative button clicked
    closeCallback?: (data: AlertPopupSettings) => void;         // Callback function if close
    props?: any;                    // Add any props for use by callback
}

interface Props {
    showDialog: AlertPopupSettings | null;
    setShowDialog: React.Dispatch<AlertPopupSettings | null>;
}

const AlertPopup: React.FC<Props> = ({ showDialog, setShowDialog }) => {

    if (!showDialog) {
        return null;
    }

    let actions=[
        {
            style: {marginLeft: "0px"} as any,
            label: showDialog.noLabel || "Close",
            onClick: async function onClick() {
                if (showDialog.noCallback) {
                    await showDialog.noCallback(showDialog);
                }
                return(setShowDialog(null))
            },
        },
    ];
    if (showDialog.yesLabel) {
            actions.push({
            style: {marginLeft: "24px", paddingLeft: "8px", paddingRight: "8px", marginTop: "4px"},
            label: showDialog.yesLabel || "Yes",
            onClick: async function onClick() {
                if (showDialog.yesCallback) {
                    await showDialog.yesCallback(showDialog);
                }
                return(setShowDialog(null))
            }
        });
    }

    return (
        <StyledDialog
            open={showDialog != null}
            title={""+showDialog.title}
            actions={actions}
            onClose={async function onClose() {
                if (showDialog.closeCallback) {
                    await showDialog.closeCallback(showDialog);
                }
                return(setShowDialog(null));
            }}
            sx={{
                paddingLeft: "25%",
                paddingRight: "25%",
            }}
        >
            {showDialog && showDialog.text && <>{showDialog.text}</>}
        </StyledDialog>
    )
}

export default AlertPopup;