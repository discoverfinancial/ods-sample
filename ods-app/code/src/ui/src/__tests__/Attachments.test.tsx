/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Attachments from "../components/Attachments";
import {AppContext} from "../common";

const mockSetDocument = jest.fn();
const mockDocMgr = {
    uploadAttachment: jest.fn(async () => [{ id: "1", name: "file.txt", url: "http://file.txt" }]),
    deleteAttachment: jest.fn(async () => []),
};
const context: AppContext = {
    isEditor: false, isEmployee: false, readGroups: [], writeGroups: [],
    editMode: true,
    isAdministrator: false,
    user: {
        email: "user@example.com", name: "User",
        id: '',
        roles: [],
        department: '',
        title: '',
        employeeNumber: ''
    },
    setError: jest.fn()
};

const documentWithAttachments = {
    id: "doc1",
    attachments: [
        { id: "1", name: "file.txt", url: "http://file.txt" },
        { id: "2", name: "image.png", url: "http://image.png" },
    ],
};
jest.mock("../models/DocMgr", () => {
    return { DogMgr: jest.fn().mockImplementation(() => mockDocMgr) };
});

it('renders attachments table with all attachments', () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getByText("file.txt")).toBeInTheDocument();
    expect(screen.getByText("image.png")).toBeInTheDocument();
});

it('shows file upload component when in edit mode', () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getByText("Drop file(s) to upload")).toBeInTheDocument();
});

it('does not show file upload component when not in edit mode', () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={{ ...context, editMode: false }} docMgr={mockDocMgr} />);
    expect(screen.queryByText("Drop file(s) to upload")).not.toBeInTheDocument();
});

it('opens attachment URL in new tab when view is triggered', () => {
    window.open = jest.fn();
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByRole("button", { name: /view/i })[0]);
    expect(window.open).toHaveBeenCalledWith("http://file.txt");
});

it('copies attachment URL to clipboard and shows snackbar', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByRole("button", { name: /copy/i })[0]);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("http://file.txt"));
    expect(screen.getByText("Attachment URL copied to clipboard")).toBeInTheDocument();
});

it('shows delete confirmation dialog when delete is triggered', () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(screen.getByText(/Delete Attachment\?/)).toBeInTheDocument();
    expect(screen.getByText(/Do you want to delete "file.txt"\?/)).toBeInTheDocument();
});

it('deletes attachment when confirmed in dialog', async () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByText("Yes"));
    await waitFor(() => expect(mockDocMgr.deleteAttachment).toHaveBeenCalledWith("doc1", "1"));
    await waitFor(() => expect(mockSetDocument).toHaveBeenCalled());
});

it('closes delete dialog when No is clicked', () => {
    render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByText("No"));
    expect(screen.queryByText(/Delete Attachment\?/)).not.toBeInTheDocument();
});

it('uploads files and updates document attachments', async () => {
    const { baseElement } = render(<Attachments document={documentWithAttachments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    // Simulate file selection
    const fileUpload = baseElement.querySelector('input[type="file"]');
    fireEvent.change(fileUpload!, { target: { files: [new File(["content"], "newfile.txt")] } });
    await waitFor(() => expect(mockDocMgr.uploadAttachment).toHaveBeenCalled());
    await waitFor(() => expect(mockSetDocument).toHaveBeenCalled());
});