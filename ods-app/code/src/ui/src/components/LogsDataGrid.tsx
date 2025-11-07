/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel, MenuItem } from "@mui/material";
import { formatDateTime } from '../common';
import { ActionPopup } from '../components/ActionPopup';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColumnResizedEvent,
    FilterChangedEvent,
    GridReadyEvent,
} from 'ag-grid-community';
import "../components/DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';


export interface DataGridSettings {
    displayColumns: string; // "default" | "all"
    filter: any;
}

interface DisplayRadioProps {
    value: string;
    setValue(value: string): void;
}

const DisplayRadio: React.FC<DisplayRadioProps> = ({ value, setValue }) => {

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
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                Display columns: &nbsp;&nbsp;
                <FormControlLabel sx={style} id="displayColumnChangeRadio1" onChange={handleChange} value="default" checked={value != "all"} control={<Radio />} label="Default" />
                <FormControlLabel sx={style} id="displayColumnChangeRadio2" onChange={handleChange} value="all" checked={value == "all"} control={<Radio />} label="All" />
            </div>
        </>
    )
}

interface Props {
    logs: any[];
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
    style?: any;
    sort?: any;
    handleDelete?: any;
    handleDeleteOlder?: any;
}

const LogsDataGrid: React.FC<Props> = ({ logs,
        settings, setSettings, style, sort,
        handleDelete, handleDeleteOlder,
    }) => {

    const [displayColumns, setDisplayColumns] = useState<string>(settings ? settings.displayColumns : "default");

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = settings ? settings.displayColumns : displayColumns;

    function onRowClicked(event: any) {
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

    const extraColumns = [
        "dateUpdated",
        "owner.email",
    ]

    const columnDefs: ColDef[] =
        [
            {
                field: "dateCreated",
                type: "dateColumn",
                headerName: "Date",
                headerTooltip: "Timestamp of log entry creation",
                cellClass: "center-text",
                cellRenderer: function (params: any) { return formatDateTime(params.data.dateCreated) },
            },

            {
                field: "value",
                headerName: "Message",
                headerTooltip: "Logging message",
                minWidth: 200,
                flex: 2,
                cellRenderer: function (params: any) {
                    if (params.value) {
                    return (
                        <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                        </Tooltip>
                    )
                    }
                },
            },

            {
                field: "owner.name",
                headerName: "User Name",
                headerTooltip: "Name of the user associated with the logging entry",
            },

            {
                field: "owner.email",
                headerName: "User Email",
                cellClass: "center-text",
                hide: settings?.displayColumns == "all" ? false : true,
                headerTooltip: "Email address of the user associated with the logging entry",
            },

            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected log entry",
                width: 125,
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (params: any) {
                    return(
                    <ActionPopup>
                        {handleDelete && <MenuItem onClick={() => handleDelete(params.data)} >Delete Log</MenuItem>}
                        {handleDeleteOlder && <MenuItem onClick={() => handleDeleteOlder(params.data)} >Delete Logs older than this one</MenuItem>}
                    </ActionPopup>)
                }
            },
        ]

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
        console.log("SORT=", sort)
        if (sort) {
            Object.keys(sort).map((colId: string) => {
                params.api.applyColumnState({
                    state: [{ colId: colId, sort: sort[colId] }],
                    defaultState: { sort: null },
                })
            })
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
            let columnsToBeExported = gridRef.current.api.getAllGridColumns().filter((col) => col.getColDef().headerName !== "Actions");
            gridRef.current!.api.exportDataAsCsv({
                columnKeys: columnsToBeExported,
                fileName: "logs.csv",
            })
        }
    }

    useEffect(() => {
        console.log("Logs data changed: ", logs ? logs.length : logs);
        if (gridRef.current && gridRef.current.api) {
            const el = document.activeElement?.querySelector('input[data-ref="eInput"]')
            gridRef.current!.api.setGridOption('rowData', logs);
            if (el) {
                (el as any).focus();
            }
            setNumRows("Number of rows: " + gridRef.current.api.getDisplayedRowCount());

            // scroll so last row is shown
            setTimeout(function() { 
                gridRef.current!.api.ensureIndexVisible(logs.length-1, 'bottom');
            }, 1);
        }    
    }, [logs])

    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
            setNumRows("Number of rows: "+gridRef.current.api.getDisplayedRowCount());

            // scroll so last row is shown
            setTimeout(function() { 
                gridRef.current!.api.ensureIndexVisible(logs.length-1, 'bottom');
            }, 1);
        }
    }, [gridReady, logs])

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
        console.log("handleRadioChange=", value);
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings({ displayColumns: value, filter: model });
        }
        else {
            setDisplayColumns(value);
        }
    }

    function getStyle() {
        if (style?.height) {
        let height = style.height;
        if (style.height && style.height.indexOf("{gridTop}")) {
            height = style.height.replace("{gridTop}", (divRef.current as any)?.offsetTop)
        }
        // console.log("Calculated height =", height);
        return { ...style, height: height };
        }
        else {
            return {};
        }
    }
    const divRef = useRef(null);

    return (
        <div className="detailDiv">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ alignItems: "center" }}>
                    <DisplayRadio value={radioButtonSelected} setValue={handleRadioChange} />
                </div>
                <div>
                    <div ref={numRowsRef}></div>
                </div>
                <div style={{ alignItems: "center", cursor: "pointer" }} onClick={doExport}>
                    <Tooltip title="Export table to CSV file" placement="top" enterDelay={500}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div >
                                <SystemUpdateAltOutlinedIcon style={{ width: "24px", color: "#656565", paddingTop: "4px" }} />
                            </div>
                            <div style={{ font: "var(--body)" }}>&nbsp; Export Table</div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="ag-theme-alpine"
                ref={divRef}
                style={{
                    width: "100%",
                    height: "400px",
                    ...getStyle()
                }}>
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    columnTypes={columnTypes}
                    rowData={logs}
                    suppressCellFocus={true}
                    onGridReady={onGridReady}
                    onColumnResized={onColumnResized}
                    onRowDoubleClicked={onRowClicked}
                    onFilterChanged={onFilterChanged}
                    domLayout='normal'
                    enableCellTextSelection={true}
                    paginationPageSize={20}
                />
            </div>
        </div>
    );
}

export default LogsDataGrid;
