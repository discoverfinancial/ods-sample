/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuidanceSummaryDataGrid, { DataGridSettings } from '../components/GuidanceSummaryDataGrid';

const mockData = [
    {
        id: '1',
        name: 'Product A',
        productTeam: 'Team Alpha',
        attestors: [
            { user: { displayName: 'Alice', email: 'alice@example.com' }, role: 'Lead' },
            { user: { displayName: 'Bob', email: 'bob@example.com' }, role: 'Member' }
        ],
        managementChain: [
            { name: 'Carol', level: 'Director', email: 'carol@example.com' }
        ],
        created: 2,
        active: 3,
        complete: 1,
        rejected: 1,
        deferred: 0,
        pending: 1,
        total: 7
    }
];

const mockHandleViewClicked = jest.fn();
const mockHandleViewAttestationsClicked = jest.fn();
const mockSetSettings = jest.fn();

it('renders grid and displays correct number of rows', async () => {
    render(
        <GuidanceSummaryDataGrid
            data={mockData}
            handleViewClicked={mockHandleViewClicked}
            handleViewAttestationsClicked={mockHandleViewAttestationsClicked}
        />
    );
    await waitFor(() => {
        expect(screen.getByText(/Number of rows: 1/)).toBeInTheDocument();
    });
});

it('toggles display columns when radio button is changed', async () => {
    const settings: DataGridSettings = { displayColumns: 'default', filter: {} };
    render(
        <GuidanceSummaryDataGrid
            data={mockData}
            handleViewClicked={mockHandleViewClicked}
            handleViewAttestationsClicked={mockHandleViewAttestationsClicked}
            settings={settings}
            setSettings={mockSetSettings}
        />
    );
    const allRadio = screen.getByLabelText('All');
    fireEvent.click(allRadio);
    await waitFor(() => {
        expect(mockSetSettings).toHaveBeenCalledWith(expect.objectContaining({ displayColumns: 'all' }));
    });
});