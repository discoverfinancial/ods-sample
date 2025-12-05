/**
 * Copyright (c) 2025 Capital One
*/

import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Tooltip } from "@mui/material";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    FilterChangedEvent,
    GridOptions,
    GridReadyEvent,
  } from 'ag-grid-community';
import "./DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';
var _ = require("lodash");

interface Props {
    data: any;
    handleViewClicked(event:any): Promise<any>;
    style?: any;
}

const JsonDataGrid: React.FC<Props> = ({
    data, 
    handleViewClicked,
    style,
}) => {

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    function onRowClicked (event:any) {
        console.log("event =", event);
        let id = "";
        if (typeof event === "string") {
            id = event;
        }
        else {
            id = event.data?._id || event;
        }
        console.log("row clicked=",id);
        handleViewClicked(id)
    }

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([])

    const gridOptions: GridOptions = {
        columnDefs: columnDefs,
    };

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
        wrapHeaderText: true,
        autoHeaderHeight: true,
    }

    const [gridReady, setGridReady] = useState<boolean>(false);

    async function onGridReady(params: GridReadyEvent) {
        console.log("Grid ready");
        setGridReady(true);
    }

    useEffect(() => {
        if (data?.length > 0) {
            console.log("setting colDefs")
            const colDefs:any = [];
            let keys:string[] = [];
            if (data) {
                for (const row of data) {
                    if (row) {
                        keys = _.union(keys, Object.keys(row));
                    }
                }
            }
            console.log("keys=", keys);
            keys.forEach((key,index) => {
                const colDef:any = {
                    field: key,
                    valueGetter: function(params: any) {
                        const value = params.data[key];
                        // console.log("valueGetter params=", value, "typeof=", typeof value);
                        if (typeof value != "object") {
                            return value;
                        }
                        else {
                            return JSON.stringify(value)
                        }
                    },
                    cellRenderer: function(params: any) {
                        const value = params.data[key];
                        // console.log("cellRenderer params=", value);
                        let v = "";
                        let t = <></>
                        if (typeof value == "string") {
                            v = value;
                            t = <div>{v}</div>
                        }
                        else {
                            v = JSON.stringify(value,null,4)
                            t = <pre>{v}</pre>
                        }
                        return (
                            <Tooltip title={t} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{v}</span>
                            </Tooltip>
                        )
                    }
                }
                if (index == 0) {
                    colDef.flex = 1;
                    colDef.minWidth = 200;
                }
                colDefs.push(colDef)
            });
            setColumnDefs(colDefs)
            if (gridRef.current!?.api) {
                setNumRows("Number of rows: "+gridRef.current!.api.getDisplayedRowCount());
            }
        }
    }, [data, gridReady]);

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
                fileName: "sbom.csv",
              })
        }
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
                    rowData={data || []}
                    suppressCellFocus={true}
                    onGridReady={onGridReady}
                    onRowDoubleClicked={onRowClicked}
                    onFilterChanged={onFilterChanged}
                    domLayout='normal'
                    enableCellTextSelection={true}
                />
            </div>
        </div>
    );
}

export default JsonDataGrid;
