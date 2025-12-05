/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { MenuItem, Radio, FormControlLabel, Tooltip } from "@mui/material";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColumnResizedEvent,
    FilterChangedEvent,
    GridOptions,
    GridReadyEvent,
  } from 'ag-grid-community';
import "./DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';
import { Bom } from '../common';
import { ActionPopup } from './ActionPopup';

export interface DataGridSettings {
    displayColumns: string; // "default" | "all"
    filter: any;
}

interface DisplayRadioProps {
    value: string;
    setValue(value: string): void;
}

const DisplayRadio: React.FC<DisplayRadioProps> = ({value, setValue}) => {

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
    data: Bom.Component[];
    handleViewClicked(event:any): Promise<any>;
    handleViewAttestationsClicked(event:any): Promise<any>;
    style?: any;
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
}

const GuidanceSummaryDataGrid: React.FC<Props> = ({
    data, 
    handleViewClicked,
    handleViewAttestationsClicked,
    style,
    settings,
    setSettings,
}) => {
    const [displayColumns, setDisplayColumns] = useState<string>(settings ? settings.displayColumns : "default");

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = settings ? settings.displayColumns : displayColumns;

    const extraColumns:any = [
        "managementChain",
        "attestors",
    ]


    function onRowClicked (event:any) {
        console.log("event =", event);
        let id = "";
        if (typeof event === "string") {
            id = event;
        }
        else {
            id = event.data?.id || event;
        }
        console.log("row clicked=",id);
        handleViewClicked(id)
    }

    function onRowDoubleClicked (event:any) {
        console.log("event =", event.data);
        handleViewAttestationsClicked(event.data)
    }


    function onViewAttestations (event:any) {
        console.log("event =", event);
        let id = "";
        if (typeof event === "string") {
            id = event;
        }
        else {
            id = event.data?.id || event;
        }
        console.log("row clicked=",id);
        handleViewAttestationsClicked(id)
    }

    async function handleRadioChange(value: string): Promise<void> {
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings({displayColumns:value, filter:model });
        }
        else {
            setDisplayColumns(value);
        }
    }

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
    }

    async function doExport() {
        if (gridRef.current && gridRef.current.api) {
            let columnsToBeExported = gridRef.current.api.getAllGridColumns().filter((col) => col.getColDef().headerName !== "Actions");
            gridRef.current!.api.exportDataAsCsv({
                columnKeys: columnsToBeExported,
                fileName: "sbom.csv",
              })
        }
    }

    const gridOptions: GridOptions = {
    };

    const columnDefs: ColDef[] =
        [
            {
                field: "name",
                headerName: "Product Name",
                flex: 2,
            },

            {
                field: "productTeam",
                headerName: "Project Team",
                flex: 2,
            },

            {
                field: "attestors",
                headerName: "Team Members",
                flex: 2,

                cellRenderer: function (params: any) {
                    if (params.data.attestors && params.data.attestors.length > 0) {
                        const attestors = params.data.attestors;
                        const rows = [];
                        const names = [];
                        for (const value of attestors) {
                            const attestor = value as any;
                            names.push(attestor.user.displayName);
                            rows.push(<tr key={attestor.user.email} style={{ height: "4em" }}><td>{attestor.user.displayName}</td><td>{attestor.role}</td><td>{attestor.user.email}</td></tr>)
                        }
                        const tooltip = <div style={{
                            backgroundColor: "white",
                            color: "black",
                            padding: "20px",
                            borderRadius: "8px"
                        }}>
                            <table className="roundedTable" style={{ width: "100%" }}>
                                <thead>
                                    <tr><th>Name</th><th>Role</th><th>Email</th></tr>
                                </thead>
                                <tbody>
                                    {rows}
                                </tbody>
                            </table>
                        </div>
                        return (
                            <Tooltip title={tooltip} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{names.join(", ")}</span>
                            </Tooltip>
                        )
                    }
                },
                valueGetter: function (params: any) {
                    if (params.data.attestors && params.data.attestors.length > 0) {
                        const names = [];
                        for (const attestor of params.data.attestors) {
                            names.push(attestor.user.displayName);
                        }
                        return names.join(", ");
                    }
                },
                hide: settings?.displayColumns == "all" ? false : true,

            },

            {
                field: "managementChain",
                headerName: "Management Chain",
                flex: 1,
                cellRenderer: function (params: any) {
                    if (params.data.managementChain && params.data.managementChain.length > 0) {
                        const managementChain = params.data.managementChain;
                        const rows = [];
                        const names = [];
                        for (const value of Object.values(managementChain)) {
                            const management = value as any;
                            names.push(management.name);
                            rows.push(<tr key={management.email} style={{ height: "4em" }}><td>{management.name}</td><td>{management.level}</td><td>{management.email}</td></tr>)
                        }
                        const tooltip = <div style={{
                            backgroundColor: "white",
                            color: "black",
                            padding: "20px",
                            borderRadius: "8px"
                        }}>
                            <table className="roundedTable" style={{ width: "100%" }}>
                                <thead>
                                    <tr><th>Name</th><th>Level</th><th>Email</th></tr>
                                </thead>
                                <tbody>
                                    {rows}
                                </tbody>
                            </table>
                        </div>
                        return (
                            <Tooltip title={tooltip} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{names.join(", ")}</span>
                            </Tooltip>
                        )
                        }
                },
                valueGetter: function (params: any) {
                    if (params.data.managementChain && params.data.managementChain.length > 0) {
                        const names = [];
                        for (const management of params.data.managementChain) {
                            names.push(management.name);
                        }
                        return names.join(", ");
                    }
                },
                hide: settings?.displayColumns == "all" ? false : true,
            },

            {
                field: "",
                headerName: "Out of Guidance",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
                flex: 1,
                valueGetter: function (params: any) { 
                    if (params.data) {
                        let count = params.data.created + params.data.active
                        return count;
                    } 
                    return 0;                 
                }
            },

            {
                field: "pending",
                headerName: "Plan Exists",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
                flex: 1,
            },

            {
                field: "total",
                headerName: "Resolved",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
                flex: 1,
                valueGetter: function (params: any) { 
                    if (params.data) {
                        let count = params.data.complete + params.data.rejected + params.data.deferred;
                        return count;
                    } 
                    return 0;                 
                }
            },

            {
                field: "total",
                headerName: "Total",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
                flex: 1,
            },

            {
                headerName: "Actions",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                width: 100,
                cellRenderer: function (params: any) {
                    if (params) {
                        const id = params.data;
                        return (
                            <ActionPopup>
                                <MenuItem onClick={() => onViewAttestations(id)} style={{cursor: "pointer"}}>
                                    Show Attestations for this Software
                                </MenuItem>
                                <MenuItem onClick={() => onRowClicked(id)} style={{cursor: "pointer"}}>
                                    View Software
                                </MenuItem>
                            </ActionPopup>
                        )
                    }
                    return(<></>)
                },
            }

        ]

    const [gridReady, setGridReady] = useState<boolean>(false);

    async function onGridReady(params: GridReadyEvent) {
        console.log("Grid ready");
        params.api.sizeColumnsToFit();
        params.api.resetRowHeights();
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

    useEffect(() => {
        if (gridRef.current!.api) {
            setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, data])

    useEffect(() => {
        if (!gridRef || !gridRef.current || !gridRef.current.api) return;
        if (displayColumns == "all") {
            gridRef.current!.api.setColumnsVisible(extraColumns, true);
        }
        else if (displayColumns == "default") {
            gridRef.current!.api.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]);


        function getStyle() {
            console.log("top/height style=", style);
            if (style) {
            let height = style.height;
            if (style.height && style.height.indexOf("{gridTop}")) {
                height = style.height.replace("{gridTop}", (divRef.current as any)?.offsetTop)
            }
            console.log("Calculated height =", height);
            return {...style, height: height};
            }
            return style;
        }
        const divRef = useRef(null);

        return (
            <div className="detailDiv">

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ alignItems: "center" }}>
                        <DisplayRadio value={radioButtonSelected} setValue={handleRadioChange}/>
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
                        ...getStyle()
                    }}>
                    <AgGridReact
                        ref={gridRef}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        gridOptions={gridOptions}
                        rowData={data}
                        suppressCellFocus={true}
                        onGridReady={onGridReady}
                        onColumnResized={onColumnResized}
                        onRowDoubleClicked={onRowDoubleClicked}
                        onFilterChanged={onFilterChanged}
                        domLayout='normal'
                        enableCellTextSelection={true}
                    />
                </div>
            </div>
        );
}

export default GuidanceSummaryDataGrid;
