/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AttachmentsTable from '../components/AttachmentsTable';
import { AttachmentInfo } from '../common';
import '@testing-library/jest-dom';

const attachments: AttachmentInfo[] = [
    {
        date: new Date('2024-06-01').getDate(), name: 'file1.txt', size: 1024,
        id: '',
        hash: '',
        type: '',
        url: ''
    },
    {
        date: new Date('2024-06-02').getDate(), name: 'file2.txt', size: 2048,
        id: '',
        hash: '',
        type: '',
        url: ''
    },
];

it('renders table with attachments and actions enabled', async () => {
    const handleViewRow = jest.fn();
    const handleDeleteRow = jest.fn();
    const handleCopyRow = jest.fn();

    render(
        <AttachmentsTable
            attachments={attachments}
            handleViewRow={handleViewRow}
            handleDeleteRow={handleDeleteRow}
            handleCopyRow={handleCopyRow}
            disabled={false}
        />
    );

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(screen.getAllByText('View')).toHaveLength(2);
    expect(screen.getAllByText('Copy')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);

    fireEvent.click(screen.getAllByText('View')[0]);
    expect(handleViewRow).toHaveBeenCalledWith(attachments[0]);

    fireEvent.click(screen.getAllByText('Copy')[1]);
    expect(handleCopyRow).toHaveBeenCalledWith(attachments[1]);

    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(handleDeleteRow).toHaveBeenCalledWith(attachments[0]);
});

it('renders table with actions disabled', () => {
    render(
        <AttachmentsTable
            attachments={attachments}
            handleViewRow={jest.fn()}
            handleDeleteRow={jest.fn()}
            handleCopyRow={jest.fn()}
            disabled={true}
        />
    );

    expect(screen.getAllByText('View')).toHaveLength(2);
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
});

it('renders "No documents" when attachments list is empty', () => {
    render(
        <AttachmentsTable
            attachments={[]}
            handleViewRow={jest.fn()}
            handleDeleteRow={jest.fn()}
            handleCopyRow={jest.fn()}
        />
    );

    expect(screen.getByText('No documents')).toBeInTheDocument();
});

it('renders "No documents" when attachments prop is undefined', () => {
    render(
        <AttachmentsTable
            // @ts-expect-error: testing undefined attachments
            attachments={undefined}
            handleViewRow={jest.fn()}
            handleDeleteRow={jest.fn()}
            handleCopyRow={jest.fn()}
        />
    );

    expect(screen.getByText('No documents')).toBeInTheDocument();
});