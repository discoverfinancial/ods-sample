/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertPopup, { AlertPopupSettings } from '../components/AlertPopup';
import '@testing-library/jest-dom';

const defaultSettings: AlertPopupSettings = {
    noLabel: 'No',
    yesLabel: 'Yes',
    title: 'Test Title',
    text: 'Test Text',
};

it('renders nothing when showDialog is null', () => {
    const setShowDialog = jest.fn();
    const { container } = render(<AlertPopup showDialog={null} setShowDialog={setShowDialog} />);
    expect(container.firstChild).toBeNull();
});

it('renders dialog with title and text', () => {
    const setShowDialog = jest.fn();
    render(<AlertPopup showDialog={defaultSettings} setShowDialog={setShowDialog} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Text')).toBeInTheDocument();
});

it('calls noCallback and closes dialog when No button is clicked', async () => {
    const noCallback = jest.fn();
    const setShowDialog = jest.fn();
    render(
        <AlertPopup
            showDialog={{ ...defaultSettings, noCallback }}
            setShowDialog={setShowDialog}
        />
    );
    fireEvent.click(screen.getByText('No'));
    fireEvent.mouseDown(document.querySelector('.MuiBackdrop-root')!);
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    expect(noCallback).toHaveBeenCalledWith(expect.objectContaining(defaultSettings));
    expect(setShowDialog).toHaveBeenCalledWith(null);
});

it('calls yesCallback and closes dialog when Yes button is clicked', async () => {
    const yesCallback = jest.fn();
    const setShowDialog = jest.fn();
    render(
        <AlertPopup
            showDialog={{ ...defaultSettings, yesCallback }}
            setShowDialog={setShowDialog}
        />
    );
    fireEvent.click(screen.getByText('Yes'));
    fireEvent.mouseDown(document.querySelector('.MuiBackdrop-root')!);
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    expect(yesCallback).toHaveBeenCalledWith(expect.objectContaining(defaultSettings));
    expect(setShowDialog).toHaveBeenCalledWith(null);
});

it('renders only No button when yesLabel is not provided', () => {
    const setShowDialog = jest.fn();
    render(
        <AlertPopup
            showDialog={{ ...defaultSettings, yesLabel: undefined }}
            setShowDialog={setShowDialog}
        />
    );
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.queryByText('Yes')).toBeNull();
});

it('uses default label "Close" when noLabel is not provided', () => {
    const setShowDialog = jest.fn();
    render(
        <AlertPopup
            showDialog={{ ...defaultSettings, noLabel: undefined }}
            setShowDialog={setShowDialog}
        />
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
});