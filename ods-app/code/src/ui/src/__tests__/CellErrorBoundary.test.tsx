/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { CellErrorBoundary } from '../components/CellErrorBoundary';

const getErrorHandlerMock = jest.fn();
jest.mock("../App", () => ({
    getErrorHandler: () => getErrorHandlerMock,
}));

function ThrowError() {
    throw new Error("Test error");
    return null;
}

it('renders children when no error occurs', () => {
    render(
        <CellErrorBoundary>
            <div>Safe content</div>
        </CellErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
});

it('renders errorHandler output when error occurs and errorHandler is provided', () => {
    getErrorHandlerMock.mockImplementation((err) => `Handled: ${err.message}`);
    render(
        <CellErrorBoundary>
            <ThrowError />
        </CellErrorBoundary>
    );
    expect(screen.getByText("Handled: Test error")).toBeInTheDocument();
});

it('resets hasError after errorHandler is called', () => {
    getErrorHandlerMock.mockImplementation(() => "Handled error");
    const { rerender } = render(
        <CellErrorBoundary>
            <ThrowError />
        </CellErrorBoundary>
    );
    expect(screen.getByText("Handled error")).toBeInTheDocument();
    rerender(
        <CellErrorBoundary>
            <div>Safe again</div>
        </CellErrorBoundary>
    );
    expect(screen.getByText("Safe again")).toBeInTheDocument();
});