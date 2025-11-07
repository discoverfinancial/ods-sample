/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AllCommentsModal from '../components/AllCommentsModal';
import '@testing-library/jest-dom';
import {SbomDocumentInfo} from "../common";
import {AppContext} from "../common";

const mockDocument : SbomDocumentInfo = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    id: 'doc1',
    comments: [],
    stateHistory: [],
    state: 'draft',
    dateCreated: 0,
    dateUpdated: 1
};

const mockContext : AppContext = {
    editMode: false, readGroups: [], writeGroups: [],
    user: {
        id: 'user1', name: 'Test User',
        roles: [],
        department: '',
        email: '',
        title: '',
        employeeNumber: ''
    },
    isAdministrator: false,
    isEditor: false,
    isEmployee: false
};
const mockSetDocument = jest.fn();
jest.mock('../components/Comments', () => () => <div data-testid="mock-comments" />);

it('renders search input and Comments component', () => {
    render(
        <AllCommentsModal
            document={mockDocument}
            setDocument={mockSetDocument}
            context={mockContext}
        />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
});

it('updates searchString when user types in search input', () => {
    render(
        <AllCommentsModal
            document={mockDocument}
            setDocument={mockSetDocument}
            context={mockContext}
        />
    );
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect((input as HTMLInputElement).value).toBe('hello');
});

it('clears searchString when clear button is clicked', () => {
    render(
        <AllCommentsModal
            document={mockDocument}
            setDocument={mockSetDocument}
            context={mockContext}
        />
    );
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'something' } });
    expect((input as HTMLInputElement).value).toBe('something');
    fireEvent.click(screen.getByLabelText('Clear Search'));
    expect((input as HTMLInputElement).value).toBe('');
});

it('does not crash if document is empty', () => {
    render(
        <AllCommentsModal
            document={{} as any}
            setDocument={mockSetDocument}
            context={mockContext}
        />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
});