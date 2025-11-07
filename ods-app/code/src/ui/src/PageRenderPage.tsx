/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material'

import { AppContext } from './common';
import { useParams } from 'react-router-dom';
import { Backdrop } from '@mui/material';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';
import { ScriptMgr } from './managers/ScriptMgr';
import { DynamicJsxComponent, Page } from './PagesEditor';

interface Props {
    context: AppContext;
}

const PageRenderPage: React.FC<Props> = ({ context }) => {
    let { id } = useParams();
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [page, setPage] = useState<any>();
    const [pageName, setPageName] = useState<string>();
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [runAsEmployee, setRunAsEmployee] = useState<boolean>(true);

    useEffect(() => {
        async function init() {
            if (id) {
                await loadPage(id);
            }
            setInitComplete(true);
        }
        if (!initComplete) {
            init();
        }
    }, [])

    useEffect(() => {
        console.log("initComplete changed to ", initComplete);
    }, [initComplete]);

    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])

    async function loadPage(id: string) {
        const scriptMgr = ScriptMgr.getInstance();
        const _currentPage = await scriptMgr.getDocument(id);
        console.log("loadPage=", _currentPage);
        if (_currentPage) {
            setPageName(_currentPage.name);
            const json: Page = JSON.parse(_currentPage.script);
            console.log(" -- page=", json);
            setPage(json.cells[0]);
            window.document.title = _currentPage.name;

            // If owner of script is admin & current user is admin, then don't need to run as employee
            if (_currentPage.owner.roles.includes("Admin") && context.isAdministrator) {
                setRunAsEmployee(false);
            }
        }
    }


    return (<>
        <Navbar context={context} />
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
            open={(showSpinner.length > 0)}
        >
            <div className="spinnerDiv">
                <p>{showSpinner}</p>
                <CircularProgress color="info" />
            </div>
        </Backdrop>

        <div className="content1" style={{ marginTop: "0px" }}>

            <TopMenu user={context.user} isAdmin={context.isAdministrator} />

            <div className="content">
                {page && <div className="detailDiv">

                    <div className="detailDiv1">
                        <div id="jsxroot" style={{ backgroundColor: "white" }}>
                            <DynamicJsxComponent context={context} reset={1} jsx={
                                `(props) => {
    const { context,
    useEffect, useState, useRef,
    mui, mgr,
    SbomDataGrid, JsonDataGrid, MostUsedDataGrid, LibrariesDataGrid, VersionsDataGrid, AgGridReact,
    d3, recharts,
    } = props;
    ${page.data}
}`

                            } data={{}} runAsEmployee={runAsEmployee} />
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    </>
    )
}

export default PageRenderPage;
