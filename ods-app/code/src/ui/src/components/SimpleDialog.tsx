/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect, ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, styled } from '@mui/material';

export interface ActionProps {
    label: string,
    onClick: () => void;
}

interface Props {
    title: string;
    open: boolean;
    onClose: () => void;
    actions?: ActionProps[];
    children: ReactNode;
}
  
export const SimpleDialog: React.FC<Props> = ({ title, open, onClose, actions, children }) => {
      
    const [showDialog, setShowDialog] = useState(open);

    useEffect(() => {
        setShowDialog(open);
    }, [open]);

    const renderActions = (actions?: any[]) => {
        let key = 1;
        if (!actions || actions.length === 0) {
            return (
                <Button key={"key"+(key++)} onClick={() => onClose()}>OK</Button>
            );
        }
        const actionsArray = actions.map((action) => {
            return (
                <Button key={"key"+(key++)} onClick={action.onClick}>{action.label}</Button>
            )
        });

        return actionsArray;
    }

    return (
        <Dialog 
            open={showDialog} 
            onClose={onClose}
            sx={{
                "& .MuiDialog-paper": {
                    padding: "20px",
                    borderRadius: "32px",
                    maxWidth: "800px",
                },
                "& .MuiDialogContent-root": {
                    whiteSpace: "pre-wrap",
                },                
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                {renderActions(actions)}
            </DialogActions>
        </Dialog>
    );
}
