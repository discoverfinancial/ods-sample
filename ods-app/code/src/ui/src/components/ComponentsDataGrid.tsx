/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel } from "@mui/material";
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
import { Bom } from '../common';

export interface DataGridSettings {
    displayColumns: string; // "default" | "all"
    filter: any;
}

// worker class for name+value pairs that live as properties in components 
class NVProperty  {
    public name: string;
    public value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    };

    public static toOutputString(property: NVProperty): string {
        return `${property.name} = ${property.value}`;
    }
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
           <FormControlLabel sx={style} id="displayColumnChangeRadio1" onChange={handleChange} value="default" checked={value !== "all"} control={<Radio />} label="Default" />
           <FormControlLabel sx={style} id="displayColumnChangeRadio2" onChange={handleChange} value="all" checked={value === "all"} control={<Radio />} label="All" />
       </div>
       </>
   )
}

interface Props {
    title: string;
    data: Bom.Component[];
    handleEditRow(event:any): Promise<any>;
    isAdmin: boolean;
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
    style?: any;
}

const ComponentsDataGrid: React.FC<Props> = ({title, data,
    handleEditRow,
    isAdmin, 
    settings, setSettings,
    style
}) => {

    const [displayColumns, setDisplayColumns] = useState<string>(settings ? settings.displayColumns : "default");

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = settings ? settings.displayColumns : displayColumns;

    const extraColumns = [
       "properties",
       "purl",
       "licenses",
    ]

    function onRowClicked (event:any) {
        console.log("row clicked=",event.data);
        // If migrated
        const bomRef = event.data["bom-ref"];
        if (bomRef.id) {
            handleEditRow(bomRef.id);
        }
        else {
            handleEditRow(bomRef);
        }
    }

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
    }

    // Compares the userSearch term against the array of strings contained in the cell.
    //  If one of the array values matches the params.filterOption type when compared to
    //  the userSearch term, then consider that as a match for the table row.
    function myPropertiesArrayComparator(params: any) {
        if (!params.filterText || !params.data || !params.data.properties || !Array.isArray(params.data.properties) || params.data.properties.length === 0) return false;
        // params.filterText should already be lowercase since we are setting caseSensitive to
        //  false in the column filter type
        const lcUserSearch = params.filterText;
        // Pull string values from params.data.properties, format them, then lowercase them.
        //  Formatting should match how it appears when the cell renders
        const lcCellValue: String[] = params.data.properties.map((property: NVProperty) => {
            if (!property) return "";
            return NVProperty.toOutputString(property).toLowerCase();
        });

        switch (params.filterOption) {
            case 'contains': {
                const found = lcCellValue.some((value) => {
                    return (value.includes(lcUserSearch));
                })
                return found;
            }
            case 'notContains': {
                // only notContains if none of the array strings match
                const found = lcCellValue.some((value) => {
                    return (value.includes(lcUserSearch));
                })
                return !found;
            }
            case 'equals': {
                const found = lcCellValue.some((value) => {
                    return (value === lcUserSearch);
                })
                return found;
            }
            case 'notEqual': {
                // only notEqual if none of the array strings match
                const found = lcCellValue.some((value) => {
                    return value === lcUserSearch;
                })
                return !found;
            }
            case 'startsWith': {
                const found = lcCellValue.some((value) => {
                    return (value.startsWith(lcUserSearch));
                })
                return found;
            }
            case 'endsWith': {
                const found = lcCellValue.some((value) => {
                    return (value.endsWith(lcUserSearch));
                })
                return found;
            }
            case 'blank': {
                if (lcCellValue.length === 0) return true;
                const found = lcCellValue.some((value) => {
                    return (value !== null || value !== "");
                })
                return !found;
            }
            case 'notBlank': {
                const found = lcCellValue.some((value) => {
                    return (value !== null || value !== "");
                })
                return found;
            }
            default:
                // should never fall here, report error if we do
                console.error(`invalid text array filter: ${params.filterOption}`);
                return false;
        }
    }

    const [additionalColumns, setAdditionalColumns] = useState<ColDef[]>([]);

    const initColumnDefs: ColDef[] =
        [
            {
                field: "type",
                headerName: "Type",
                headerTooltip: "The type of software.  This value will be one of Product, Application, ITComponent, Interface, UserGroup, BusinessCapability, framework or library.",
                width: 200,
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    const value = ""+params.data.type;
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
                    if (value.length > 0) {
                        return types[value];
                    }
                    return "";
                },
            },

            {
                field: "name",
                headerName: "Name",
                headerTooltip: "Software name",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
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
                field: "version",
                headerName: "Version",
                headerTooltip: "Software version",
                width: 200,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
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
                field: "group",
                headerName: "Group",
                headerTooltip: "Grouping name or namespace.  Often refers to the company, organization or project that published the software.",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
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
                field: "purl",
                headerName: "PURL",
                headerTooltip: "Package URL.  Used to identify and locate software packages",
                flex: 2,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
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
                field: "licenses",
                headerName: "Licenses",
                headerTooltip: "Licenses associated with the software",
                hide: settings?.displayColumns == "all" ? false : true,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    if (params && params.value) {
                        const s = params.value.join(", ");
                        return (
                            <Tooltip title={s} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{s}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
                valueGetter: function (params: any) {
                    if (params && params.data) {
                        const value = params.data.licenses;
                        const licenses = [];
                        for (const v of value) {
                            if (v.license.name) {
                                licenses.push(v.license.name);
                            }
                            else if (v.license.id) {
                                licenses.push(v.license.id);
                            }
                            else if (v) {
                                licenses.push(JSON.stringify(v));
                            }
                        }
                        return licenses;
                    }
                },
            },

            {
                field: "properties",
                headerName: "Properties",
                headerTooltip: "Component properties",
                type: "propertiesArrayColumn",
                hide: settings?.displayColumns == "all" ? false : true,
                minWidth: 200,
                flex: 1,
                autoHeight: true,
                cellClass: "component-properties text-overflow-cell",
                cellRenderer: function (params: any) { 
                    // console.log("properties = ", params.value);
                    if (params.value) {
                        // const value:any = [];
                        const tooltip:any = [];
                        for (const prop of params.value) {
                            const nvprop = prop as NVProperty;
                            tooltip.push(<span key={nvprop.name}>{NVProperty.toOutputString(nvprop)}<br/></span>)
                        }
                        return (
                            <Tooltip title={<div>{tooltip}</div>} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{tooltip}</span>
                            </Tooltip>
                        )
                    }
                    return "";
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
        },
        propertiesArrayColumn: {
            type: "text",
            filter: 'agTextColumnFilter',
            filterParams: {
                textMatcher: myPropertiesArrayComparator,
                defaultOption: "contains", //notContains, equals, notEqual, startsWith, endsWith
                caseSensitive: false
            },
            suppressMenu: true,
        }
    };

    const [gridReady, setGridReady] = useState<boolean>(false);

    async function onGridReady(params: GridReadyEvent) {
        console.log("Grid ready");
        params.api.sizeColumnsToFit();
        params.api.resetRowHeights();
        if (settings) {
            gridRef.current!.api.setFilterModel(settings.filter);
        }
        setGridReady(true);
    }

    useEffect(() => {
        if (gridReady && gridRef.current!) {
            if (settings && settings.filter) {
                const model = gridRef.current!.api.getFilterModel();
                gridRef.current!.api.setFilterModel(settings.filter);
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
    }

    async function doExport() {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current!.api.exportDataAsCsv({
                allColumns: true,
                fileName: "components.csv",
              })
        }
    }

    useEffect(() => {
        console.log("ComponentsDataGrid data changed: ", data ? data.length : data);

        if (data && data.length > 0) {
            console.log("ComponentsDataGrid - looking for additional columns");
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

    }, [data])

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

    async function handleRadioChange(value: string): Promise<void> {
       if (setSettings) {
           const model = gridRef.current!.api.getFilterModel();
           setSettings({displayColumns:value, filter:model });
       }
       else {
           setDisplayColumns(value);
       }
    }
    
   
    var r:boolean = true;
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
                        ..._style
                    }}
                    >
                    <AgGridReact
                        ref={gridRef}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        columnTypes={columnTypes}
                        rowData={data}
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

export default ComponentsDataGrid;
