/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel } from "@mui/material";
import { Button } from '@mui/material'
import { customTheme } from "../theme";
import { SbomDocumentSummary, formatDate } from '../common'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColumnResizedEvent,
    FilterChangedEvent,
    GridReadyEvent,
  } from 'ag-grid-community';
import { Checkbox } from '@mui/material';
import "./DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';

export interface DataGridSettings {
    displayColumns: string; // "default" | "all"
    filter: any;
}

interface DisplayRadioProps {
    value: string;
    setValue(value: string): void;
    isAdmin: boolean;
}

const DisplayRadio: React.FC<DisplayRadioProps> = ({value, setValue, isAdmin}) => {

    async function handleChange(event: any): Promise<void> {
        setValue(event.target.value);
    }

    const style = {
        ".MuiTypography-root": {
            font: "var(--body)"
        }
    }

    return (
        <>
        <div style={{display:"flex", justifyContent:"flex-end", alignItems:"center"}}>
            Display columns: &nbsp;&nbsp;
            <FormControlLabel sx={style} id="displayColumnChangeRadio1" onChange={handleChange} value="default" checked={value != "all"} control={<Radio />} label="Default" />
            <FormControlLabel sx={style} id="displayColumnChangeRadio2" onChange={handleChange} value="all" checked={value == "all"} control={<Radio />} label="All" />
        </div>
        </>
    )
}

interface Props {
    title: string;
    states?: string[];
    requests: SbomDocumentSummary[];
    handleEditRow(event:any): Promise<any>;
    handleDeleteRow(event:any): Promise<any>;
    isAdmin: boolean;
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
    style?: any;
}

const AssembliesDataGrid: React.FC<Props> = ({title, requests, states, handleEditRow, handleDeleteRow, isAdmin, settings, setSettings, style}) => {

    const [displayColumns, setDisplayColumns] = useState<string>(settings ? settings.displayColumns : "default");

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = settings ? settings.displayColumns : displayColumns;

    const extraColumns = [
        "group",
        "purl",
    ]

    function onRowClicked (event:any) {
        console.log("row clicked=",event.data);
        handleEditRow(event.data);
    }

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
        wrapHeaderText: true,
        autoHeaderHeight: true,
    }

    const [additionalColumns, setAdditionalColumns] = useState<ColDef[]>([]);

    const initColumnDefs: ColDef[] =
        [
            {
                field: "metadata.component.type",
                headerName: "Type",
                headerTooltip: "The type of software.  This value will be one of Product, Application, ITComponent, Interface, UserGroup, BusinessCapability, framework or library.",
                width: 200,
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    let value = ""+params.data.metadata?.component?.type;

                    // If migrated
                    if (params.data.type) {
                        value = params.data.type;
                    }
                    const types:any = {
                        "application": "Application",
                        "framework": "Framework",
                        "library": "Library",
                        "operating-system": "Operating System",
                        "device": "Device",
                        "file": "File",
                        "container": "Container",
                        "firmware": "Firmware",
                        "device-driver": "Device Driver",
                        "platform": "Platform",
                        "machine-learning-model": "Machine Learning Model",
                        "data": "Data",
                        "cryptographic-asset": "Cryptographic Asset",
                    }
                    if (value.length > 0 && types[value]) {
                        return types[value];
                    }
                    return value;
                },
            },

            {
                field: "metadata.component.name",
                headerName: "Name",
                headerTooltip: "Software name",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    let value = params.value;
                    return (
                        <Tooltip title={value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{value}</span>
                        </Tooltip>
                    )
                },
                valueGetter: function (params: any) {
                    let value = params.value;

                    // If migrated
                    if (params.data.name) {
                        value = params.data.name;
                    }
                    return value;
                },
            },

            {
                field: "metadata.component.version",
                headerName: "Version",
                headerTooltip: "Software version",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    let value = params.value;
                    return (
                        <Tooltip title={value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{value}</span>
                        </Tooltip>
                    )
                },
                valueGetter: function (params: any) {
                    let value = params.value;

                    // If migrated
                    if (params.data.version) {
                        value = params.data.version;
                    }
                    return value;
                },
            },
            {
                field: "group",
                headerName: "Group",
                headerTooltip: "Grouping name or namespace.  Often refers to the company, organization or project that published the software.",
                minWidth: 200,
                flex: 1,
                hide: settings?.displayColumns == "all" ? false : true,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    let value = params.value;

                    // If migrated
                    if (params.data.group) {
                        value = params.data.group;
                    }
                    return (
                        <Tooltip title={value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{value}</span>
                        </Tooltip>
                    )
                },
            },
            {
                field: "purl",
                headerName: "PURL",
                headerTooltip: "Package URL.  Used to identify and locate software packages",
                minWidth: 200,
                flex: 1,
                hide: settings?.displayColumns == "all" ? false : true,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    let value = params.value;

                    // If migrated
                    if (params.data.purl) {
                        value = params.data.purl;
                    }
                    return (
                        <Tooltip title={value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{value}</span>
                        </Tooltip>
                    )
                },
            },
        ]

    const [columnDefs, setColumnDefs] = useState<ColDef[]>(initColumnDefs);

    useEffect(() => {
        if (additionalColumns) {
            console.log("additionalColumns changed: ", additionalColumns);
            for (const col of additionalColumns) {
                col.cellRenderer = function (params: any) {
                    let v = params.value
                    let t = v;
                    if (v) {
                        if (typeof v == "object") {
                            v = JSON.stringify(v,null,4)
                            t = <pre>{v}</pre>
                        }
                        return (
                            <Tooltip title={t} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{v}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                }

                if (col.field && col.headerName) {
                    // Check if the column already exists
                    const existingCol = columnDefs.find(c => c.field === col.field);
                    if (!existingCol) {
                        columnDefs.push(col);
                    } else {
                        // Update existing column properties
                        Object.assign(existingCol, col);
                    }
                }
            }
            setColumnDefs([...columnDefs]);
        }
    }, [additionalColumns]);

    const columnTypes = {
        nonEditableColumn: { editable: false },
        dateColumn: {
            type: "number",
            filter: 'agDateColumnFilter',
            filterParams: { 
                defaultOption: "greaterThan", //equals, notEqual, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange
            },
            suppressMenu: true,
        }
    };

    const [gridReady, setGridReady] = useState<boolean>(false);

    async function onGridReady(params: GridReadyEvent) {
        console.log("Grid ready");
        if (settings) {
            gridRef.current!.api.setFilterModel(settings.filter);
        }
        setGridReady(true);
    }

    const onColumnResized = useCallback((params: ColumnResizedEvent) => {
    }, []);

    function setNumRows(numRowsMessage: string) {
        const numRowsField = numRowsRef.current;
        if (!numRowsField) return;
        numRowsField.textContent = numRowsMessage;
    }

    async function onFilterChanged(params: FilterChangedEvent) {
        setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
    }

    async function doExport() {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current!.api.exportDataAsCsv({
                allColumns: true,
                fileName: "assemblies.csv",
              })
        }
    }

    useEffect(() => {
        console.log("AssembliesDataGrid data changed: ", requests ? requests.length : requests);

        if (requests && requests.length > 0) {
            console.log("AssembliesDataGrid - looking for additional columns");
            const colDefs: ColDef[] = [];
            for (const key of Object.keys(requests[0])) {
                if (key.startsWith("$") || key.startsWith("#")) {
                    const colDef:any = {
                        field: key,
                        hide: false,
                        headerName: key.replace("$", "").replace("#", "").replaceAll("_", " "),
                        cellRenderer: function(params: any) {
                            let v = "";
                            let t = <></>
                            if (typeof params.value == "string") {
                                v = params.value;
                                t = <div>{v}</div>
                            }
                            else {
                                v = JSON.stringify(params.value,null,4)
                                t = <pre>{v}</pre>
                            }
                            return (
                                <Tooltip title={t} placement="bottom-start" enterDelay={500}>
                                    <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{v}</span>
                                </Tooltip>
                            )
                        }
                    }
                    colDefs.push(colDef);
                }
            }
            setAdditionalColumns(colDefs);
        }

    }, [requests])

    useEffect(() => {
        if (gridRef.current!.api) {
            setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, requests])

    useEffect(() => {
        if (!gridRef || !gridRef.current || !gridRef.current.api) return;
        if (displayColumns == "all") {
            gridRef.current!.api.setColumnsVisible(extraColumns, true);
        }
        else if (displayColumns == "default") {
            gridRef.current!.api.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]);

    async function handleRadioChange(value: string): Promise<void> {
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings({displayColumns:value, filter:model });
        }
        else {
            setDisplayColumns(value);
        }
    }
    const [_style, _setStyle] = useState<any>(style);
    useEffect(() => {
        let height = _style.height;
        if (_style.height && _style.height.indexOf("{gridTop}")) {
            height = _style.height.replace("{gridTop}", (divRef.current as any)?.offsetTop)
        }
        console.log("Calculated height =", height);
        _setStyle({..._style, height: height});
        }, []);
    const divRef = useRef(null);
    return (
        <div className="detailDiv">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ alignItems: "center" }}>
                    <DisplayRadio value={radioButtonSelected} setValue={handleRadioChange} isAdmin={isAdmin}/>
                </div>
                <div>
                    <div ref={numRowsRef}></div>
                </div>
                <div style={{ alignItems: "center", cursor: "pointer" }} onClick={doExport}>
                    <Tooltip title="Export table to CSV file" placement="top" enterDelay={500}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div >
                                <SystemUpdateAltOutlinedIcon style={{ width:"24px", color: "#656565", paddingTop: "4px" }} />
                            </div>
                            <div style={{font: "var(--body)"}}>&nbsp; Export Table</div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="ag-theme-alpine"
                 ref={divRef}
                 style={{
                     width: "100%",
                     height: "400px",
                     ..._style,
                 }}
            >
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    columnTypes={columnTypes}
                    rowData={requests}
                    suppressCellFocus={true}
                    onGridReady={onGridReady}
                    onColumnResized={onColumnResized}
                    onRowDoubleClicked={onRowClicked}
                    onFilterChanged={onFilterChanged}
                    domLayout='normal'
                    enableCellTextSelection={true}
                />
            </div>
        </div>
    );
}

export default AssembliesDataGrid;
