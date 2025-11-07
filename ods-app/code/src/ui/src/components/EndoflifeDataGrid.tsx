/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel, MenuItem, Divider } from "@mui/material";
import { SbomDocumentSummary, formatDate, Endoflife } from '../common'
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
import "./DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';

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
    requests: Endoflife[];
    handleEditRow?(event:any): Promise<any>;
    handleDeleteRow?(event:any): Promise<any>;
    isAdmin: boolean;
    settings?: any;
    setSettings?(event: any): Promise<any>;
    displayColumns?: string;
    setDisplayColumns?(event: any): Promise<any>;
    style?: any;
    sort?: any;
}

let key = 1;

const EndoflifeDataGrid: React.FC<Props> = ({title, requests, states, handleEditRow,  handleDeleteRow,
    isAdmin, settings, setSettings, displayColumns, setDisplayColumns, style, sort }) => {

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = displayColumns || "default";

    const extraColumns = [
        "reviewers",
    ]


    function onRowClicked (event:any) {
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
                field: "data.result.name",
                headerName: "Name",
                headerTooltip: "Software Name",
                minWidth: 200,
                flex: 1,
                pinned: "left",
                cellRenderer: function (params: any) {
                    return (
                        <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                        </Tooltip>
                    )    
                },
            },

            {
                field: "data.result.category",
                headerName: "Category",
                headerTooltip: "Software Category",
                minWidth: 200,
                flex: 1,
                pinned: "left",
                cellRenderer: function (params: any) {
                    return (
                        <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                        </Tooltip>
                    )
                },
            },

            {
                field: "data.result.releases",
                headerName: "Releases",
                headerTooltip: "Release versions available for the software",
                minWidth: 800,
                flex: 2,
                autoHeight: true,
                cellRenderer: function (params: any) { 
                    const value = params.data?.data?.result?.releases;
                    if (value && value.length > 0) {
                        const r = [];
                        for (const release of value) {
                            r.push(<tr key={"v_"+(key++)}>
                                <td>{release.name}</td>
                                <td>{release.releaseDate}</td>
                                <td>{release.isMaintained == true ? "Yes" : "No"}</td>
                                {/* <td>{release.isDiscontinued?.toString()}</td> */}
                                <td>{release.eolFrom}</td>
                                <td>{release.eoasFrom}</td>
                                <td>{release.eoesFrom}</td>
                                {/* <td>{release.ltsFrom}</td> */}
                                {/* <td>{release.discontinuedFrom}</td> */}
                                {/* <td>{!release.isEoas ? "Supported" : "Unsupported"}</td>
                                <td>{!release.isEol ? "Supported" : "Unsupported"}</td> */}
                            </tr>)
                        }
                        const releaseTable = <div style={{padding:"16px"}}>
                        <table className="roundedTable" style={{border:"1px solid black", width:"100%"}}>
                            <thead>
                            <tr>
                                <th>Release</th>
                                <th>Release Date</th>
                                <th>Maintained</th>
                                {/* <th>Discontinued</th> */}
                                <th>EOL Date</th>
                                <th>EOAS Date</th>
                                <th>EOES Date</th>
                                {/* <th>LTS Date</th> */}
                                {/* <th>Discontinued Date</th> */}
                                {/* <th>End of Service</th>
                                <th>End of Life</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {r}
                            </tbody>
                        </table>
                        </div>
                        return releaseTable
                    }
                },
                valueGetter: function(params) {
                    if (params.data?.data?.result?.releases) {
                        const r = JSON.stringify(params.data.data.result.releases);
                        console.log("valueGetter releases=", r);
                        return r;
                    }
                    return [];
                }
            },


            {
                field: "data.last_modified",
                headerName: "Last Modified",
                headerTooltip: "Data Last Modified Date",
                width: 150,
                cellRenderer: function (params: any) {
                    return (
                        <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{new Date(params.value).toLocaleDateString()}</span>
                        </Tooltip>
                    )
                },
            },


            {
                field: "data.result.tags",
                headerName: "Tags",
                headerTooltip: "Tags for the software",
                minWidth: 200,
                flex: 1,
                wrapText: true,
                cellRenderer: function (params: any) {
                    if (params.value && params.value.length > 0) {
                        const r = [];
                        const s = [];
                        for (const tag of params.value) {
                            r.push(<div style={{lineHeight: "1.4em"}} key={"v_"+(key++)}>{tag}</div>)
                            s.push(tag);
                        }
                        return (
                            /*<Tooltip title={<div>{r}</div>} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{s.join(", ")}</span>
                            </Tooltip>*/
                            <div style={{paddingTop: "12px"}}>{r}</div>
                        )
                    }
                },
                hide: displayColumns == "all" ? false : true,
            },

            {
                field: "data.result.identifiers",
                headerName: "Identifiers",
                headerTooltip: "Identifiers for the software",
                minWidth: 500,
                flex: 1,
                wrapText: true,
                cellRenderer: function (params: any) {
                    if (params.value && params.value.length > 0) {
                        const r = [];
                        const s = [];
                        for (const identifier of params.value) {
                            r.push(<div style={{lineHeight: "1.4em"}} key={"v_"+(key++)}>{identifier.type + "=" + identifier.id}</div>)
                            s.push(identifier.type + "=" + identifier.id);
                        }
                        return (
                            /*<Tooltip title={<div>{r}</div>} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{s.join(", ")}</span>
                            </Tooltip>*/
                            <div style={{paddingTop: "12px"}}>{r}</div>
                        )
                    }
                },
                hide: displayColumns == "all" ? false : true,
            },

            {
                field: "dateCreated",
                type: "dateColumn",
                headerName: "Date Created",
                headerTooltip: "Date that the ODS SBOM document was created",
                width: 175,
                cellClass: "center-text",
                cellRenderer: function (params: any) { return formatDate(params.data.dateCreated) },
                hide: displayColumns == "all" ? false : true,
            },
            {
                field: "dateUpdated",
                type: "dateColumn",
                headerName: "Date Updated",
                headerTooltip: "Date that the Surveyor ODS SBOM document was last updated",
                width: 175,
                cellClass: "center-text",
                cellRenderer: function (params: any) { return formatDate(params.data.dateUpdated) },
                hide: displayColumns == "all" ? false : true,
            },

            {
                field: "id",
                headerName: "Endoflife Id",
                headerTooltip: "id of Endoflife document containing software information",
                width: 300,
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
            },

            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected software",
                width: 125,
                pinned: "right",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (i: any) {
                    if (i && i.data) {

                        return (
                        <ActionPopup>
                            {handleEditRow && <MenuItem onClick={() => handleEditRow(i.data.id)} >View Software Details</MenuItem>}
                            {isAdmin && handleDeleteRow && <MenuItem onClick={() => handleDeleteRow(i.data.id)} >Delete</MenuItem>}
                        </ActionPopup>
                        )
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
            gridRef.current!.api.setFilterModel(settings.filter);
        }
        console.log("SORT=", sort)
        if (sort) {
            Object.keys(sort).map((colId:string) => {
                params.api.applyColumnState({
                    state: [ { colId: colId, sort: sort[colId]}],
                    defaultState: { sort: null },
                })
            })
        }
        if (requests) {
            gridRef.current!.api.setGridOption('rowData', requests);
        }
        setGridReady(true)
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
    }, []);

    function setNumRows(numRowsMessage: string) {
        const numRowsField = numRowsRef.current;
        if (!numRowsField) return;
        numRowsField.textContent = numRowsMessage;
    }

    async function onFilterChanged(params: FilterChangedEvent) {
        setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
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
        console.log("EndoflifeDataGrid data changed");

        if (requests && requests.length > 0) {
            console.log("EndoflifeDataGrid - looking for additional columns");
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

    }, [requests]);

    useEffect(() => {
        console.log("EndoflifeDataGrid data changed: ", requests ? requests.length : requests);
        if (gridRef.current && gridRef.current.api) {
            const el = document.activeElement?.querySelector('input[data-ref="eInput"]')
            gridRef.current!.api.setGridOption('rowData', requests);
            if (el) {
                (el as any).focus();
            }
            setNumRows("Number of rows: " + gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, requests])

    useEffect(() => {
        if (!gridRef || !gridRef.current || !gridRef.current.api) return;
        setColumnDefs([...initColumnDefs, ...additionalColumns || []]);
        if (displayColumns == "all") {
            gridRef.current!.api.setColumnsVisible(extraColumns, true);
        }
        else if (displayColumns == "default") {
            gridRef.current!.api.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]);

    async function handleRadioChange(value: string): Promise<void> {
        if (setDisplayColumns) setDisplayColumns(value);
    }
       
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

                <div className="ag-theme-alpine" data-testid="ag-grid-div"
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

export default EndoflifeDataGrid;
