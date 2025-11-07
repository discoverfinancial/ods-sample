/**
 * Copyright (c) 2025 Capital One
*/

import React from 'react';
import { Button } from '@mui/material'
import { styled } from "@mui/material";
import { formatDate, formatFileSize } from '../common';
import { AttachmentInfo } from '../common'

interface Props {
    attachments: AttachmentInfo[];
    handleViewRow(file:AttachmentInfo): Promise<any>;
    handleDeleteRow(file:AttachmentInfo): Promise<any>;
    handleCopyRow(file:AttachmentInfo): Promise<any>;
    disabled?: boolean;
}

const AttachmentsTable: React.FC<Props> = ({attachments, handleViewRow, handleDeleteRow, handleCopyRow, disabled}) => {

    const TableTheme = styled("table")(({ theme }) => ({
        width: "100%",
        "th": {
            padding: theme.spacing(1.25), //"10px",
        },
        "tr": {
        },
        "td": {
            paddingLeft: theme.spacing(1), //"4px",
            paddingRight: theme.spacing(1), //"4px",
        },
        ".date": {
            width: "150px",
            textAlign: "center",
        },
        ".name": {
            minWidth: "200px",
        },
        ".size": {
            width: "150px",
            textAlign: "right",
        },
        ".action": {
            width: "350px",
        },
    }));

    if (attachments && attachments.length > 0) {
        return (
            <div>
                <TableTheme className="roundedTable">
                    <thead><tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Action</th>
                    </tr></thead>
                    <tbody>
                    {attachments.map((attachment, i) =>
                        <tr key={i}>
                            <td className="date">{formatDate(attachment.date)}</td>
                            <td className="name">{attachment.name}</td>
                            <td className="size">{formatFileSize(attachment.size)}</td>
                            <td className="action actionCol">
                                <Button value={i} onClick={() => handleViewRow(attachments[i])} >View</Button> &nbsp;
                                {!disabled && <>
                                    <Button value={i} onClick={() => handleCopyRow(attachments[i])} >Copy</Button> &nbsp;
                                    <Button value={i} onClick={() => handleDeleteRow(attachments[i])} >Delete</Button>
                                </>}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </TableTheme>
            </div>
        )
    }
    else {
        return (<div>No documents</div>)
    }

}

export default AttachmentsTable;