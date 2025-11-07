/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel, MenuItem, Divider } from "@mui/material";
import { SbomDocumentSummary, formatDate } from '../common/common'
import { ActionPopup } from './ActionPopup';
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
import { compareVersions, renderSoftwareName, createBomRef, getBasePurl } from '../common/util';


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
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
    handleEditRow?(event: any): Promise<any>;
    handleShowSbomVersions?(event: any): Promise<any>;
    handleDeleteRow?(event: any): Promise<any>;
    isAdmin: boolean;
    settings?: any;
    setSettings?(event: any): Promise<any>;
    displayColumns?: string;
    setDisplayColumns?(event: any): Promise<any>;
    style?: any;
    sort?: any;
}

const SbomDataGrid: React.FC<Props> = ({ title, requests, states, handleEditRow, handleShowSbomVersions, handleDeleteRow,
    isAdmin, settings, setSettings, displayColumns, setDisplayColumns, style, sort }) => {

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = displayColumns || "default";

    const extraColumns = [
        "reviewers",
    ]

    function onRowClicked (event:any) {
        //console.log("row clicked=",event.data);
        if (handleEditRow) {
            handleEditRow(event.data.id)
        }
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
                field: "metadata.component.name",
                headerName: "Name",
                headerTooltip: "Software name",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                pinned: "left",
                cellRenderer: function (params: any) {
                    //console.log("params=",params);
                    let name = params?.value;
                    if (!name) {
                        name = params.data?.id;
                    }
                    if (name) {
                        let found = null;
                        const _guidance = name;
                        return (
                            <Tooltip title={_guidance} placement="bottom-start" enterDelay={500}>
                                <span className={found ? "guidanceAvailable" : ""} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{name}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "metadata.component.group",
                headerName: "Group",
                headerTooltip: "Grouping name or namespace.  Often refers to the company, organization or project that published the software.",
                cellClass: "center-text",
                pinned: "left",
            },

            {
                field: "metadata.component.version",
                headerName: "Version",
                headerTooltip: "Software version",
                // minWidth: 200,
                // flex: 1,
                pinned: "left",
                comparator: function(v1, v2) {
                    return compareVersions(v1, v2);
                },
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    //console.log("params=",params);
                    if (params && params.value) {
                        return (
                            <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "metadata.component.type",
                headerName: "Software Type",
                headerTooltip: "The type of software.  This value will be one of Product, Application, ITComponent, Interface, UserGroup, BusinessCapability, framework or library.",
                width: 200,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    // console.log("lifcycles params=",params);
                    const value = ""+params.data?.metadata?.component?.type;
                    const types:any = {
                        // "0": "Unspecified",
                        // "1": "Application",
                        // "2": "Framework",
                        // "3": "Library",
                        // "4": "Operating System",
                        // "5": "Device",
                        // "6": "File",
                        // "7": "Container",
                        // "8": "Firmware",
                        // "9": "Device Driver",
                        // "10": "Platform",
                        // "11": "Machine Learning Model",
                        // "12": "Data",
                        // "13": "Cryptographic Asset",
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

                        "usergroup": "User Group",
                    }
                    if (value.length > 0) {
                        const r = types[value];
                        if (r) {
                            return r;
                        }
                        return value;
                    }
                },
            },

            //{
            //    field: "_compliance", //"metadata.component.version",
            //    headerName: "In Guidance",
            //    headerTooltip: "Indicates whether given version of software is recommended for use. This is relevant for libraries.",
            //    // width: 200,
            //    cellClass: "center-text",
            //    // hide: uses ? false : true,
            //},
            {
                field: "metadata.lifecycles.0.phase",
                headerName: "Phase",
                headerTooltip: "The phase of the development lifecyle the software was in when information was captured.  Possible values include Design, Build, Operations, Decommission.",
                // width: 200,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    // console.log("lifcycles params=",params);
                    if (params.data?.metadata?.lifecycles) {
                        const value = ""+params.data?.metadata?.lifecycles[0]?.phase;
                        const phases:any = {
                            // "0": "Design",
                            // "1": "Pre-Build",
                            // "2": "Build", 
                            // "3": "Post-Build",
                            // "4": "Operations",
                            // "5": "Discovery",
                            // "6": "Decommission",
                            "design": "Design",
                            "pre-build": "Pre-Build",
                            "build": "Build", 
                            "post-build": "Post-Build",
                            "operations": "Operations",
                            "discovery": "Discovery",
                            "decommission": "Decommission",
                        }
                        if (value.length > 0) {
                            if (phases[value]) {
                                return phases[value];
                            }
                            return value;
                        }
                    }
                    return "";
                },
            },

            // {
            //     field: "state",
            //     headerName: "State",
            //     width: 200,
            //     cellClass: "center-text",
            //     valueGetter: function (params: any) { 
            //         if (docStates[params.data.state]) {
            //             return docStates[params.data.state].label
            //         }
            //     },
            // },

            {
                field: "components",
                headerName: "Components",
                headerTooltip: "Number of dependencies",
                filter: "agNumberColumnFilter",
                // width: 200,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    // if (params.data.compositions && params.data.compositions.length > 0) {
                    //     return params.data.compositions[0]?.assemblies.length
                    // }
                    if (params.data?.components) {
                        return params.data.components.length;
                    }
                    return 0
                },
            },

            {
                field: "vulnerabilities",
                headerName: "Vulnerabilities",
                headerTooltip: "Number of vulnerabilities",
                filter: "agNumberColumnFilter",
                // width: 200,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    // if (params.data.vulnerabilities) {
                    //     return params.data.vulnerabilities.length
                    // }
                    if (params.data?._vulnerabilities) {
                        return params.data._vulnerabilities
                    }
                    return 0
                },
            },

            {
                field: "metadata.component.purl",
                headerName: "PURL",
                headerTooltip: "Package URL.  Used to identify and locate software packages",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    //console.log("params=",params);
                    let purl = params.data?.metadata?.component?.purl;
                    if (purl) {
                        return (
                            <Tooltip title={purl} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{purl}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "_depsdev.scorecard.overallScore",
                headerName: "Overall Score",
                headerTooltip: "Deps.dev overall score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                // minWidth: 200,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
            },


            {
                field: "_depsdev.scorecard.Maintained",
                headerName: "Maintained Score",
                headerTooltip: "Deps.dev maintained score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                // minWidth: 200,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
            },

            {
                field: "_depsdev.scorecard.Vulnerabilities",
                headerName: "Vulnerabilities Score",
                headerTooltip: "Deps.dev vulnerabilities score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                // minWidth: 200,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
            },

            {
                field: "id",
                headerName: "Id",
                headerTooltip: "id of Surveyor SBOM document containing software information",
                minWidth: 250,
                cellClass: "center-text",
                hide: displayColumns == "all" ? false : true,
            },

            {
                field: "dateCreated",
                type: "dateColumn",
                headerName: "Date Created",
                headerTooltip: "Date that the Surveyor SBOM document was created",
                width: 175,
                cellClass: "center-text",
                cellRenderer: function (params: any) { return formatDate(params.data?.dateCreated) },
                hide: displayColumns == "all" ? false : true,
            },
            {
                field: "dateUpdated",
                type: "dateColumn",
                headerName: "Date Updated",
                headerTooltip: "Date that the Surveyor SBOM document was last updated",
                width: 175,
                cellClass: "center-text",
                cellRenderer: function (params: any) { return formatDate(params.data?.dateUpdated) },
                hide: displayColumns == "all" ? false : true,
            },
            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected software",
                width: 125,
                pinned: "right",
                // cellClass: "center-text",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (i: any) {
                    if (i && i.data && i.data.metadata) {
                        // console.log("i.data=", i.data)
                        let bomRef = i.data.metadata.component["bom-ref"];
                        // if (!bomRef && migrated) {
                        if (!bomRef) {
                            const md = i.data.metadata.component;
                            bomRef = createBomRef(md, i.data.id);
                        }
                        return (
                        <ActionPopup>
                            {handleEditRow && <MenuItem onClick={() => handleEditRow(i.data.id)} >View Software Details</MenuItem>}
                            {isAdmin && handleDeleteRow && <MenuItem onClick={() => handleDeleteRow(i.data)} >Delete Software</MenuItem>}
                        </ActionPopup>
                        )

                        // let s = [];
                        // if (handleEditRow) {
                        // s.push(
                        //     <Tooltip key="ae" title="Edit Request" placement="bottom" enterDelay={500}>
                        //         <span onClick={() => handleEditRow(i.data.id)} style={{cursor: "pointer"}}>
                        //             <EditIcon style={{ fontSize: "1.25rem", color: "#656565" }} />
                        //         </span>
                        //     </Tooltip>);
                        // }
                        // if (isAdmin && handleDeleteRow) {
                        //     s.push(
                        //         <Tooltip key="ad" title="Delete Request" placement="bottom" enterDelay={500}>
                        //             <span style={{ paddingLeft: 10, cursor: "pointer"}} onClick={() => handleDeleteRow(i.data)}>
                        //                 <DeleteIcon style={{ fontSize: "1.25rem", color: "#656565" }} />
                        //             </span>
                        //         </Tooltip>);
                        // }
                        // return (<>{s}</>)                        
                    }
                    return(<></>)
                },
            }

        ]
    const [columnDefs, setColumnDefs] = useState<ColDef[]>(initColumnDefs);

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

    useEffect(() => {
        if (additionalColumns) {
            console.log("additionalColumns changed: ", additionalColumns);
            for (const col of additionalColumns) {
                col.cellRenderer = function (params: any) {
                    let v = params.value
                    if (v) {
                        return (
                            <Tooltip title={v} placement="bottom-start" enterDelay={500}>
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
        if (settings) {
            gridRef.current!.api.setFilterModel(settings);
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
        if (requests) {
            gridRef.current!.api.setGridOption('rowData', requests);
        }
        setGridReady(true);
    }

    useEffect(() => {
        if (gridReady && gridRef.current!) {
            if (settings) {
                gridRef.current!.api.setFilterModel(settings);
            }
            else {
                gridRef.current!.api.setFilterModel({});
            }
        }
    }, [settings, gridReady])

    const onColumnResized = useCallback((params: ColumnResizedEvent) => {
        //console.log("Column resized: ", params);
    }, []);

    function setNumRows(numRowsMessage: string) {
        const numRowsField = numRowsRef.current;
        if (!numRowsField) return;
        numRowsField.textContent = numRowsMessage;
    }

    async function onFilterChanged(params: FilterChangedEvent) {
        setNumRows("Number of rows: " + gridRef.current!.api.getDisplayedRowCount());
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings(model);
        }
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

    useEffect(() => {
        console.log("SbomDataGrid data changed");

        if (requests && requests.length > 0) {
            console.log("SbomDataGrid - looking for additional columns");
            const colDefs: ColDef[] = [];
            for (const key of Object.keys(requests[0])) {
                if (key.startsWith("$")) {
                    const colDef:any = {
                        field: key,
                        hide: false,
                        headerName: key.replace("$", "").replaceAll("_", " "),
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

    }, [requests]);

    useEffect(() => {
        console.log("SbomDataGrid data changed: ", requests ? requests.length : requests);
        if (gridRef.current && gridRef.current.api) {
            // <input data-ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-4-input" tabindex="-1" aria-label="Column with Header Selection">
            const el = document.activeElement?.querySelector('input[data-ref="eInput"]')
            // console.log(">>focus el=", el);
            gridRef.current!.api.setGridOption('rowData', requests);
            if (el) {
                (el as any).focus();
            }
            setNumRows("Number of rows: " + gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, requests])

    useEffect(() => {
        // console.log("Set value for radio:", displayColumns)
        if (!gridRef || !gridRef.current || !gridRef.current.api) {console.log('return'); return;}
        setColumnDefs([...initColumnDefs, ...additionalColumns || []]);
        if (displayColumns == "all") {
            gridRef.current!.api.setColumnsVisible(extraColumns, true);
        }
        else if (displayColumns == "default") {
            gridRef.current!.api.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]);

    async function handleRadioChange(value: string): Promise<void> {
        //console.log("handleRadioChange=", value);
        if (setDisplayColumns) setDisplayColumns(value);
    }
    
    var r:boolean = true;
    if (typeof states !== "undefined") {
        r = false;
    }
    if (requests && requests?.length > 0) {
        if (!requests[0].hasOwnProperty("id")) {
            r = false;
        }
    }

    function getStyle() {
        // console.log("top/height style=", style);
        let height = style.height;
        if (style.height && style.height.indexOf("{gridTop}")) {
            height = style.height.replace("{gridTop}", (divRef.current as any)?.offsetTop)
        }
        // console.log("Calculated height =", height);
        return { ...style, height: height };
    }
    const divRef = useRef(null);

    return (
        <div className="detailDiv">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ alignItems: "center" }}>
                    <DisplayRadio value={radioButtonSelected} setValue={handleRadioChange} isAdmin={isAdmin} />
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
                    // rowData={r ? requests : []}
                    suppressCellFocus={true}
                    onGridReady={onGridReady}
                    onColumnResized={onColumnResized}
                    onRowDoubleClicked={onRowClicked}
                    onFilterChanged={onFilterChanged}
                    domLayout='normal'
                    // domLayout="autoHeight"
                    enableCellTextSelection={true}
                    // pagination={true}
                    // paginationPageSize={20}
                />
            </div>
        </div>
    );
}

export default SbomDataGrid;
