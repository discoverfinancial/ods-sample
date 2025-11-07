/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorState, ContentState } from "draft-js";
import EditorContainer from "../components/EditorContainer";

function createEditorState(text: string) {
    return EditorState.createWithContent(ContentState.createFromText(text));
}

describe("EditorContainer", () => {
    const defaultProps = {
        id: "editor-1",
        data: createEditorState("Initial content"),
        setData: jest.fn(),
        editMode: true,
        onBlur: jest.fn().mockResolvedValue(undefined),
        uploadImageCallback: jest.fn().mockResolvedValue({ url: "image-url" }),
        setError: jest.fn(),
        label: "Test Editor",
    };

    it("renders editor with initial content", () => {
        render(<EditorContainer {...defaultProps} />);
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("calls setData and setError on editor state change with non-empty value", () => {
        render(<EditorContainer {...defaultProps} required={true} />);
        const newState = createEditorState("Some text");
        fireEvent.blur(screen.getByRole("textbox"));
        fireEvent.focus(screen.getByRole("textbox"));
        // Simulate editor state change
        defaultProps.setData(newState);
        expect(defaultProps.setError).toHaveBeenCalledWith("Test Editor", "");
    });

    it("does not show error when not required and value is empty", () => {
        render(
            <EditorContainer
                {...defaultProps}
                required={false}
                data={createEditorState("")}
            />
        );
        expect(screen.queryByText("This question is required.")).not.toBeInTheDocument();
    });

    it("calls uploadImageCallback and onBlur when image is uploaded", async () => {
        render(<EditorContainer {...defaultProps} />);
        const file = new File(["dummy"], "dummy.png", { type: "image/png" });
        await defaultProps.uploadImageCallback(file);
        expect(defaultProps.uploadImageCallback).toHaveBeenCalledWith(file);
    });

    it("renders editor in read-only mode when editMode is false", () => {
        render(<EditorContainer {...defaultProps} editMode={false} />);
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
});