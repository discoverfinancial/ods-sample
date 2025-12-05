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
import { Bom, compareVersions } from '../common';
import { ActionPopup } from './ActionPopup';

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
    data: Bom.Component[];
    handleUsedByClicked(event:any): Promise<any>;
    handleViewClicked(event:any): Promise<any>;
    isAdmin: boolean;
    style?: any;
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
    basePurl?: string;
    guidance?: any;
}

const VersionsDataGrid: React.FC<Props> = ({
    title, 
    data, 
    handleViewClicked,
    handleUsedByClicked, 
    isAdmin, 
    style,
    settings,
    setSettings,
    basePurl,
    guidance,
}) => {
    const [displayColumns, setDisplayColumns] = useState<string>(settings ? settings.displayColumns : "default");

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);
    const [guidanceObj, setGuidanceObj] = useState<any>();

    const radioButtonSelected = settings ? settings.displayColumns : displayColumns;

    const extraColumns = [
        "vulnerabilities",
    ]

    function onDoubleClicked (event:any) {
        console.log("event =", event);
        console.log("row double clicked=",event.data);
        handleViewClicked(event.data)
    }


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

    function onUsedByClicked (event:any) {
        console.log("event =", event);
        let id = "";
        if (typeof event === "string") {
            id = event;
        }
        else {
            id = event.data?.id || event;
        }
        console.log("row clicked=",id);
        handleUsedByClicked(id)
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
        tooltipShowDelay: 1000,
    };

    const [additionalColumns, setAdditionalColumns] = useState<ColDef[]>([]);

    const initColumnDefs: ColDef[] =
        [
            {
                field: "name",
                headerName: "Name",
                headerTooltip: "Library name",
                flex: 1,
                valueGetter: function (params: any) { 
                    if (params.data) {
                        if (params.data.name) {
                            return params.data.name;
                        }
                    } 
                    return "";                 
                }
            },

            {
                field: "version",
                headerName: "Version",
                headerTooltip: "Library version",
                flex: 1,
                comparator: function(v1, v2) {
                    return compareVersions(v1, v2);
                },
                valueGetter: function (params: any) { 
                    if (params.data) {
                        if (params.data.version) {
                            return params.data.version;
                        }
                    } 
                    return "";                 
                }
            },

            {
                field: "group",
                headerName: "Group",
                headerTooltip: "Package namespace.  Where library packages is published.",
                flex: 1,
                valueGetter: function (params: any) { 
                    if (params.data) {
                        if (params.data.group) {
                            return params.data.group;
                        }
                    } 
                    return "";                 
                }
            },

            {
                field: "basePurl",
                headerName: "Base Purl",
                headerTooltip: "Package URL. Identifies package and its location.",
                flex: 2,
                cellRenderer: function (params: any) { 
                    if (params.data) {
                        if (params.data.basePurl) {
                            const s = params.data.basePurl;
                            return (
                                <Tooltip title={s} placement="bottom-start" enterDelay={500}>
                                    <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{s}</span>
                                </Tooltip>
                            )
                        }
                    }
                }
            },

            {
                field: "count",
                headerName: "Count",
                headerTooltip: "Number of products that depend on this library",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
            },

            {
                field: "version",
                headerName: "In Guidance",
                headerTooltip: "Indicates whether version of library falls within guidance",
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    if (params && params.data && guidanceObj && guidanceObj.state == "active") {
                        const parts = params.data; 
                        if (parts.version) {
                            const v = parts.version;
                            if (compareVersions(v, guidanceObj?.nonPci?.preferredVersion.minimum) < 0) {
                                    return "No"
                            }
                            else {
                                return "Yes"
                            }
                        }
                    } 
                }
            },

            {
                field: "scorecard.overallScore",
                headerName: "Overall Score",
                headerTooltip: "Deps.dev overall score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
            },


            {
                field: "scorecard.Maintained",
                headerName: "Maintained Score",
                headerTooltip: "Deps.dev maintained score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
            },

            {
                field: "scorecard.Vulnerabilities",
                headerName: "Vulnerabilities Score",
                headerTooltip: "Deps.dev vulnerabilities score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
            },

            {
                field: "vulnerabilities",
                headerName: "Vulnerabilities",
                filter: "agNumberColumnFilter",
                cellClass: "center-text",
                hide: settings?.displayColumns == "all" ? false : true,
            },

            {
                field: "scorecard.isDeprecated",
                headerName: "Deprecated",
                headerTooltip: "Deps.dev indicates that this library is deprecated.",
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    if (params.data.scorecard) {
                        if (params.data.scorecard.isDeprecated) {
                            return "Yes"
                        }
                        return "No";
                    }
                },
            },

            {
                field: "scorecard.isArchived",
                headerName: "Archived",
                headerTooltip: "Deps.dev indicates that this library is archived.",
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    if (params.data.scorecard) {
                        if (params.data.scorecard.isArchived) {
                            return "Yes"
                        }
                        return "No";
                    }
                },
            },

            {
                field: "scorecard.publishedAt",
                headerName: "Published Date",
                headerTooltip: "Deps.dev indicates that this version of this library was published on this date.",
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    if (params.data.scorecard?.publishedAt) {
                        return new Date(params.data.scorecard.publishedAt).toLocaleDateString();
                    }
                },
            },
            
            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected software",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (params: any) {
                    if (params) {
                        const id = params.data;
                        return (
                            <ActionPopup>
                                <MenuItem onClick={() => onRowClicked(id)} style={{cursor: "pointer"}}>
                                    View Software
                                </MenuItem>
                                <MenuItem onClick={() => onUsedByClicked(id)} style={{cursor: "pointer"}}>
                                    Show Software that uses this version
                                </MenuItem>
                            </ActionPopup>
                        )
                    }
                    return(<></>)
                },
            }

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
        console.log("VersionsDataGrid data changed");

        if (data && data.length > 0) {
            console.log("VersionsDataGrid - looking for additional columns");
            const colDefs: ColDef[] = [];
            for (const key of Object.keys(data[0])) {
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

    }, [data]);

    useEffect(() => {
        if (gridRef.current!.api) {
            setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, data])

    useEffect(() => {
        console.log("Guidance changed: type=", (typeof guidance));
        async function run() {
            const r = await guidance(basePurl);
            if (r) {
                setGuidanceObj(r);
            }
        }
        if (typeof guidance == "function") {
            run();
        }
        else {
            setGuidanceObj(guidance);
        }
    }, [guidance])

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
                        onRowDoubleClicked={onDoubleClicked}
                        onFilterChanged={onFilterChanged}
                        domLayout='normal'
                        enableCellTextSelection={true}
                    />
                </div>
            </div>
        );
}

export default VersionsDataGrid;
