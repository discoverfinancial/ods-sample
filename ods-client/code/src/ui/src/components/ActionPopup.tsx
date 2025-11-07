/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';

interface Props {
    children?: React.ReactNode;
}

export const ActionPopup: React.FC<Props> = ({children}) => {

    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // show the menu by placing it in the DOM
        setAnchorElement(event.currentTarget);
    };

    const handleMenuClose = () => {
        // hide the menu by taking it out of the DOM
        setAnchorElement(null);
    };
 
    // when anchorElement is set, then consider the menu open, otherwise it is closed
    return (
        <div>
          <IconButton
            aria-label="action"
            aria-controls={anchorElement ? 'long-menu' : undefined}
            aria-expanded={anchorElement ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            {<MoreVert />}
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            autoFocus={false}
            anchorEl={anchorElement}
            open={Boolean(anchorElement)}
            onClick={handleMenuClose}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                // width: '20ch',
              },
            }}
          >
            {children}
          </Menu>
        </div>
    );
}