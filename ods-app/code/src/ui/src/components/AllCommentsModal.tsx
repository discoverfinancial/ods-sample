/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState } from 'react';
import { SbomDocumentInfo, formatDateTime } from '../common';
import { AppContext } from "../common";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Comments from './Comments';
import { TextField } from '@mui/material';
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
    document: SbomDocumentInfo;
    setDocument: React.Dispatch<React.SetStateAction<SbomDocumentInfo | undefined>>;
    context: AppContext;
}

const AllCommentsModal: React.FC<Props> = ({ document, setDocument, context }) => {

    const [searchString, setSearchString] = useState<string>("");

    function onSearchStringChange(event: any): void {
        const value = event.target.value;
        setSearchString(value)
    }

    const handleSearchClear = () => {
        setSearchString("");
    }

    return (
        <>
            <TextField
                id="all-comments-search"
                placeholder='Search...'
                value={searchString}
                onChange={onSearchStringChange}
                sx={{ width: "100%", left: "20px", mb: 2 }}
                InputProps={{
                    endAdornment:
                        <IconButton
                            aria-label="Clear Search"
                            onClick={handleSearchClear}
                            style={{margin: "0 24px"}}
                        >
                            <CloseIcon/>
                        </IconButton>
                }}


            />
            <div className="spacer"/>
            <Comments
                context={context}
                document={document}
                setDocument={setDocument}
                searchString={searchString}
            />
            <br />
        </>
    )
}

export default AllCommentsModal;
