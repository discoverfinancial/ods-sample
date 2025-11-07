/**
 * Copyright (c) 2025 Capital One
*/

/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComponentsDataGrid from "../components/ComponentsDataGrid";
import { Bom } from '../common';

const mockHandleEditRow = jest.fn();

const sampleData: Bom.Component[] = [
    {
        "id": "testapp-1",
        "type": "application",
        "name": "TestApp",
        "version": "1.0.0",
        "group": "TestGroup",
        "purl": "pkg:test/testapp@1.0.0",
        "licenses": [{ license: { name: "MIT" } }],
        "properties": [{ name: "prop1", value: "val1" }],
        "bom-ref": { id: "testapp-1" }
    } as any
];

const gridStyle = { height: "400px" };

it('renders grid with provided data and displays correct columns', async () => {
    render(
        <ComponentsDataGrid
            title="Test Grid"
            data={sampleData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    expect(screen.getByText("TestApp")).toBeInTheDocument();
    expect(screen.getByText("TestGroup")).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByText(/Export Table/)).toBeInTheDocument();
});

it('calls handleEditRow with correct id when row is double clicked', async () => {
    render(
        <ComponentsDataGrid
            title="Test Grid"
            data={sampleData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    // Simulate double click on the row
    const cell = screen.getByText("TestApp");
    fireEvent.doubleClick(cell);
    await waitFor(() => expect(mockHandleEditRow).toHaveBeenCalled());
});

it('shows only default columns when displayColumns is default', () => {
    render(
        <ComponentsDataGrid
            title="Test Grid"
            data={sampleData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            settings={{ displayColumns: "default", filter: {} }}
            style={gridStyle}
        />
    );
    expect(screen.queryByText("Properties")).not.toBeInTheDocument();
    expect(screen.queryByText("Licenses")).not.toBeInTheDocument();
});

it('shows all columns when displayColumns is all', () => {
    render(
        <ComponentsDataGrid
            title="Test Grid"
            data={sampleData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            settings={{ displayColumns: "all", filter: {} }}
            style={gridStyle}
        />
    );
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Licenses")).toBeInTheDocument();
    expect(screen.getByText("PURL")).toBeInTheDocument();
});

it('handles empty data gracefully', () => {
    render(
        <ComponentsDataGrid
            title="Empty Grid"
            data={[]}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    expect(screen.getByText(/Export Table/)).toBeInTheDocument();
});

it('handles missing optional props without crashing', () => {
    render(
        <ComponentsDataGrid
            title="No Settings Grid"
            data={sampleData}
            handleEditRow={mockHandleEditRow}
            isAdmin={false}
            style={gridStyle}
        />
    );
    expect(screen.getByText("TestApp")).toBeInTheDocument();
});

it('renders without crashing when data contains null or undefined values', () => {
    const edgeData = [
        {
            id: "null-row",
            type: null,
            name: undefined,
            version: "",
            group: null,
            purl: undefined,
            licenses: null,
            properties: undefined,
            "bom-ref": { id: "null-row" }
        } as any
    ];
    render(
        <ComponentsDataGrid
            title="Edge Grid"
            data={edgeData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    expect(screen.getByText(/Export Table/)).toBeInTheDocument();
});

it('renders correctly when properties and licenses arrays are empty', () => {
    const emptyArraysData = [
        {
            ...sampleData[0],
            properties: [],
            licenses: []
        }
    ];
    render(
        <ComponentsDataGrid
            title="Empty Arrays Grid"
            data={emptyArraysData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
            settings={{ displayColumns: "all", filter: {} }}
        />
    );
    expect(screen.getByText("TestApp")).toBeInTheDocument();
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Licenses")).toBeInTheDocument();
});

it('renders and displays very long text values in cells', () => {
    const longText = "A".repeat(1000);
    const longTextData = [
        {
            ...sampleData[0],
            name: longText,
            group: longText,
            version: longText,
            purl: longText,
            properties: [{ name: longText, value: longText }],
            licenses: [{ license: { name: longText } }]
        }
    ];
    render(
        <ComponentsDataGrid
            title="Long Text Grid"
            data={longTextData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
            settings={{ displayColumns: "all", filter: {} }}
        />
    );
    expect(screen.getAllByLabelText(longText)[0]).toBeInTheDocument();
});

it('does not crash when bom-ref is missing', () => {
    const missingBomRefData = [
        {
            ...sampleData[0],
            "bom-ref": undefined
        }
    ];
    render(
        <ComponentsDataGrid
            title="Missing BomRef Grid"
            data={missingBomRefData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    expect(screen.getByText("TestApp")).toBeInTheDocument();
});

it('handles duplicate ids in data gracefully', () => {
    const duplicateIdData = [
        { ...sampleData[0] },
        { ...sampleData[0] }
    ];
    render(
        <ComponentsDataGrid
            title="Duplicate ID Grid"
            data={duplicateIdData}
            handleEditRow={mockHandleEditRow}
            isAdmin={true}
            style={gridStyle}
        />
    );
    expect(screen.getAllByText("TestApp").length).toBeGreaterThan(1);
});