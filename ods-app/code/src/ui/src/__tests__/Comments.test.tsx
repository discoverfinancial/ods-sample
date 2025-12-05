/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Comments from "../components/Comments";
import { EditorState } from "draft-js";
import {AppContext} from "../common";

const mockSetDocument = jest.fn();
const mockDocMgr = {
    addComment: jest.fn(async () => ({ comments: [{ user: { name: "User", email: "user@example.com" }, text: "<p>New comment</p>", date: new Date(), topic: "", id: "1", private: false, edited: [] }] })),
    deleteCommentForId: jest.fn(async () => ({ comments: [] })),
    updateCommentForId: jest.fn(async () => ({ comments: [{ user: { name: "User", email: "user@example.com" }, text: "<p>Updated comment</p>", date: new Date(), topic: "", id: "1", private: false, edited: [] }] })),
    uploadAttachment: jest.fn(async () => [{ name: "file.png", url: "http://file.png" }]),
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

const documentWithComments = {
    comments: [
        {
            user: { name: "User", email: "user@example.com" },
            text: "<p>Hello world</p>",
            date: new Date(),
            topic: "",
            id: "1",
            private: false,
            edited: [],
        },
        {
            user: { name: "Other", email: "other@example.com" },
            text: "<p>Private comment</p>",
            date: new Date(),
            topic: "",
            id: "2",
            private: true,
            edited: [],
        },
    ],
    id: "doc1",
};
jest.mock("../models/DocMgr", () => {
    return { DogMgr: jest.fn().mockImplementation(() => mockDocMgr) };
});

it('renders all comments and shows "None" when no comments exist', () => {
    render(<Comments document={{ comments: [] }} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getByText("None")).toBeInTheDocument();

    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Private comment")).toBeInTheDocument();
});

it('shows edit and delete buttons for editable comments', () => {
    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
});

it('adds a new comment and clears editor', async () => {
    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getByText("Add Comment"));
    await waitFor(() => expect(mockDocMgr.addComment).toHaveBeenCalled());
    await waitFor(() => expect(mockSetDocument).toHaveBeenCalled());
});

it('deletes a comment and updates document', async () => {
    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    await waitFor(() => expect(mockDocMgr.deleteCommentForId).toHaveBeenCalledWith(documentWithComments, "1"));
    await waitFor(() => expect(mockSetDocument).toHaveBeenCalled());
});

it('shows editor when Edit is clicked and saves edited comment', async () => {
    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(screen.getByText("Edit Comment:")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save Comment"));
    await waitFor(() => expect(mockDocMgr.updateCommentForId).toHaveBeenCalled());
    await waitFor(() => expect(mockSetDocument).toHaveBeenCalled());
});

it('filters comments by topic and search string', () => {
    render(<Comments document={documentWithComments} setDocument={mockSetDocument} context={context} topic="*" searchString="hello" docMgr={mockDocMgr} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.queryByText("Private comment")).not.toBeInTheDocument();
});

it('shows edited tooltip when comment has edits', () => {
    const docWithEdited = {
        comments: [
            {
                user: { name: "User", email: "user@example.com" },
                text: "<p>Edited comment</p>",
                date: new Date(),
                topic: "",
                id: "1",
                private: false,
                edited: [{ user: { name: "Editor", email: "editor@example.com" }, date: new Date() }],
            },
        ],
        id: "doc2",
    };
    render(<Comments document={docWithEdited} setDocument={mockSetDocument} context={context} docMgr={mockDocMgr} />);
    expect(screen.getByText("(Edited)")).toBeInTheDocument();
});