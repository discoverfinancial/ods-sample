/**
 * Copyright (c) 2025 Capital One
*/

import React from 'react';
import { Button } from '@mui/material'
import { styled } from "@mui/material";
import { Person } from '../common';

interface Props {
    members: Person[];
    setMembers: React.Dispatch<React.SetStateAction<Person[]>>;
    updated?(data:Person[]): Promise<void>;
    disabled?: boolean;
}

const MembersTable: React.FC<Props> = ({members, setMembers, updated, disabled}) => {

    const TableTheme = styled("table")(({ theme }:any) => ({
        width: "100%",
        ".name": {
            width: "250px;",
        },
        ".email": {
            minWidth: "200px;",
        },
        ".action": {
            width: "150px;",
        },
        ".contact": {
            width: "250px;",
        }
    }));

    /**
     * Member deleted
     * 
     * @param event 
     */
     async function handleDeleteMember(event: any): Promise<void> {
        event.preventDefault();
        console.log("delete member: ", event.target.value);
        const id = event.target.value;
        let data = members.filter((item:Person, i) => {
            return (i != id) // can't be !==
        });
        await setMembers(data);
        if (updated) {
            await updated(data);
        }
    }

    if (members && members.length > 0) {
    return (
        <div>
        <TableTheme className="membersTable roundedTable">
            <thead><tr>
                <th>Name</th>
                <th>Email</th>
                {!disabled && <th>Action</th>}
            </tr></thead>
            <tbody>
                {members.map((member, i) =>
                    <tr key={i} style={{height:"40px"}} >
                        <td className="name">{member.name}</td>
                        <td className="email">{member.email}</td>
                        {!disabled && <td className="action actionCol"><Button value={i} onClick={handleDeleteMember}>Delete</Button></td>}
                    </tr>
                )}
            </tbody>
        </TableTheme>
        </div>
    )
    }
    else {
        return (<div>No members</div>)
    }
}

export default MembersTable;
