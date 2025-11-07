/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Divider, MenuItem, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
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
import { ActionPopup } from './ActionPopup';
import { capitalize, compareVersions } from '../common';
import { OssAnalysis } from '../common';

let key = 0;

interface Props {
    title: string;
    data: OssAnalysis[];
    handleDetailsClicked(event:any): Promise<any>;
    handleRowClicked(event:any): Promise<any>;
    handleGuidanceClicked(event:any): Promise<any>;
    isAdmin: boolean;
    style?: any;
    guidance?: any;
    pci?: boolean;
}

const OssAnalysisDataGrid: React.FC<Props> = ({
    title, 
    data, 
    handleDetailsClicked,
    handleRowClicked,
    handleGuidanceClicked, 
    isAdmin, 
    style,
    guidance,
    pci,
}) => {
    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    function onRowDoubleClicked (event:any) {
        const id = event.data;
        onRowClicked(id);
    }

    function onRowClicked (id:any) {
        console.log("row clicked=",id);
        handleRowClicked(id)
    }

    function onDetailsClicked (id:any) {
        console.log("details clicked=",id);
        handleDetailsClicked(id)
    }

    
    function onGuidanceClicked (id:any) {
        console.log("row clicked=",id);
        handleGuidanceClicked(id)
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
                field: "name",
                headerName: "Name",
                headerTooltip: "Software name",
                flex: 1,
            },

            {
                field: "purl",
                headerName: "Purl",
                headerTooltip: "Package URL.  Used to identify and locate software packages",
                flex: 1,
                cellRenderer: function (params: any) {
                    if (params.value) {
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
                headerTooltip: "Library version.",
                flex: 1,
                cellClass: "center-text",
            },

            {
                field: "guidance",
                headerName: "Recommended Minimum Version", //"Guidance for " + (pci ? "Pci" : "non-Pci"),
                headerTooltip: "Summary of available guidance for a Library. Recommended version.",
                cellClass: "center-text",
                flex: 1,
                autoHeight: true,
                wrapText: true,
                valueGetter: function (params: any) {
                    if (params && params.data) {
                        const guidance = params.data.guidance;
                        if (guidance) {
                            if (guidance.state == "active") {
                                if (pci && guidance?.pci?.preferredVersion?.minimum) {
                                    return guidance.pci.preferredVersion.minimum;
                                }
                                if (!pci && guidance?.nonPci?.preferredVersion?.minimum) {
                                    return guidance.nonPci.preferredVersion.minimum;
                                }
                                return "";
                            }
                            else if (guidance.state) {
                                return [capitalize(guidance.state)]
                            }
                        }
                    }
                },
            },

            {
                field: "none",
                headerName: "Upgrade Candidate",
                headerTooltip: "Consider updating library version to latest version.",
                flex:1,
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    if (params && params.data) {
                        const guidance = params.data.guidance;
                        const version = params.data.version;
                        if (guidance && version) {
                            if (guidance.state == "active") {
                                let preferredVersion = "";
                                if (pci && guidance?.pci?.preferredVersion?.minimum) {
                                    preferredVersion = guidance.pci.preferredVersion.minimum;
                                }
                                if (!pci && guidance?.nonPci?.preferredVersion?.minimum) {
                                    preferredVersion = guidance.nonPci.preferredVersion.minimum;
                                }
                                if (preferredVersion) {
                                    if (compareVersions(version, preferredVersion) < 0) {
                                        return "Yes";
                                    }
                                    return "No";
                                }
                            }
                        }
                    }
                },

            },

            {
                field: "latestVersion",
                headerName: "Latest Version",
                headerTooltip: "Latest version available for library.",
                flex: 1,
                cellClass: "center-text",
            },

            // {
            //     field: "scorecard.overallScore",
            //     headerName: "Overall Score",
            //     headerTooltip: "Deps.dev overall score from scorecard (0=lowest - 10=best).  Score is from latest version of library.",
            //     filter: "agNumberColumnFilter",
            //     // minWidth: 200,
            //     flex:1,
            //     cellClass: "center-text",
            // },


            {
                field: "scorecard.Maintained.score",
                headerName: "Maintained Score",
                headerTooltip: "Deps.dev maintained score from scorecard (0=lowest - 10=best).  Score is from latest version of library.",
                filter: "agNumberColumnFilter",
                flex:1,
                cellClass: "center-text",
            },

            {
                field: "scorecard.Maintained.reason",
                headerName: "Maintained Reason",
                headerTooltip: "Reason for Deps.dev maintained score from scorecard.",
                cellClass: "center-text",
                cellRenderer: function (params: any) {
                    if (params.value) {
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

            // {
            //     field: "scorecard.Vulnerabilities.score",
            //     headerName: "Vulnerabilities Score",
            //     headerTooltip: "Deps.dev vulnerabilities score from scorecard (0=lowest - 10=best).  Score is from latest version of library.",
            //     filter: "agNumberColumnFilter",
            //     // minWidth: 200,
            //     flex:1,
            //     cellClass: "center-text",
            // },

            // {
            //     field: "scorecard.Vulnerabilities.reason",
            //     headerName: "Vulnerabilities Reason",
            //     headerTooltip: "Reason for Deps.dev vulnerabilities score from scorecard.",
            //     // minWidth: 200,
            //     cellClass: "center-text",
            //     cellRenderer: function (params: any) {
            //         if (params.value) {
            //             return (
            //                 <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
            //                     <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
            //                 </Tooltip>
            //             )
            //         }
            //         return(<></>)
            //     },
            // },

            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected software",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (params: any) {
                    if (params) {
                        const data = params.data;
                        const links:any = [];
                        if (data.links) {
                            for (const link of data.links) {
                                links.push(<MenuItem key={"menu_"+(key++)}
                                    onClick={() => window.open(link.url, "_blank")}
                                >
                                    View Deps.dev link for {capitalize(link.label.toLowerCase())}
                                </MenuItem>)
                            }
                        }
                        let depsdevUrl = "";
                        if (data.packageKey && data.packageKey.system) {
                            depsdevUrl = "https://deps.dev/" + (data.packageKey.system).toLowerCase() + "/" + encodeURIComponent(data.packageKey.name);
                        }
                        return (
                            <ActionPopup>
                                <MenuItem onClick={() => onDetailsClicked({name: data.name, group: data.group, basePurl: data.basePurl})} >View Software Details</MenuItem>
                                <MenuItem onClick={() => onRowClicked({name: data.name, group: data.group, basePurl: data.basePurl})} >View Versions</MenuItem>
                                <MenuItem onClick={() => onGuidanceClicked({name: data.name, group: data.group, basePurl: data.basePurl})} >View Guidance</MenuItem>
                                {links.length && <Divider/>}
                                {links}
                                {depsdevUrl && <Divider/>}
                                {depsdevUrl && <MenuItem onClick={() => window.open(depsdevUrl, "_blank")} >View on Deps.dev</MenuItem>}
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
        console.log("LibrariesDataGrid data changed");

        if (data && data.length > 0) {
            console.log("SbomDataGrid - looking for additional columns");
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
                <div style={{ alignItems: "center" }}></div>
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
            }}>
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
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

export default OssAnalysisDataGrid;
