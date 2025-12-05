/**
 * Copyright (c) 2025 Capital One
*/


import React from 'react';
import { Avatar } from '@mui/material';
import { Person } from 'dlms-base';

const getInitials = (name: string) => {
    var names = name.split(' '),
    initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

interface Props {
    user: Person;
    style?: any;
}

const UserAvatar: React.FC<Props> = ({ user, style }) => {
    return (
        <Avatar className="sm" style={style}>
            {getInitials(user.name)}
        </Avatar>
    )
}

export default UserAvatar;
