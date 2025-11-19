/**
 * Copyright (c) 2025 Capital One
*/

import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './AdminPage';
import { themes } from "./mui-a11y-tb/themes/Theme";
import { ThemeProvider } from '@mui/material';
import DocumentListPage from './DocumentListPage';
import DocumentDetailsPage from './DocumentDetailsPage';
import VersionsListPage from './VersionsListPage';
import { AppContext } from './common';
import LogsPage from './LogsPage';
import TestPage from './Test';
import AlertPopup, { AlertPopupSettings } from './components/AlertPopup';
import HelpPage from './HelpPage';
import ImportPage from "./ImportPage";
import EtlPage from './EtlPage';
import LibrariesListPage from './LibrariesListPage';
import { User } from 'dlms-base';
import { Role } from './common';
import { Http } from './Http';
import { Buffer } from 'buffer';
import ScriptEditor from './ScriptEditor';
import ScriptsListPage from './ScriptsListPage'
import MostUsedListPage from './MostUsedListPage';
import TopLevelListPage from './TopLevelListPage';
import EtlLogsPage from './EtlLogsPage';
import PageRenderPage from './PageRenderPage';
import PagesListPage from './PagesListPage';
import PagesEditor from './PagesEditor';
import NotebooksListPage from './Notebooks/NotebooksListPage';
import NotebookEditor from './Notebooks/NotebookEditor';
import EndoflifeListPage from './EndoflifeListPage';
import EndoflifeDetailsPage from './EndoflifeDetailsPage';


console.log("Document cookies = ", JSON.stringify(document.cookie, null, 4));

export function getCookie(key: string): any {
    var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
    return b ? b.pop() : "";
}

// Allow global error handler dialog to be replaced
let errorHandler: any;
export function setErrorHandler(handler: any) {
    errorHandler = handler;
}
export function getErrorHandler() {
    return errorHandler;
}

let info: any;
let remoteInfo: any;
let __context: any;

const defaultUser: User = {
    id: "Employee",
    roles: [
        Role.Employee,
        // Role.Administrator,
        // Role.Editor,
    ],
    name: "Employee",
    department: "Department",
    email: "employee@email.com",
    title: "Employee",
    employeeNumber: "unknown",
};

interface Props {
}

const App: React.FC<Props> = ({ }) => {

    const [context, setContext] = useState<AppContext>();

    useEffect(() => {
        const run = async function () {

            let http: Http;
            console.log("env=", process.env);
            if (process.env.REACT_APP_ODS_SERVER1) {
                http = Http.init(process.env.REACT_APP_ODS_SERVER1, updateContext);
            }
            else if (window.location.hostname == "localhost" && process.env.REACT_APP_SERVER) {
                http = Http.init(window.location.origin.replace(window.location.port, process.env.REACT_APP_SERVER), updateContext)
            }
            else {
                http = Http.init(window.location.origin, updateContext);
            }

            info = await getInfo();
            if (process.env.REACT_APP_ODS_SERVER) {
                remoteInfo = await getRemoteInfo();
            }
            else {
                remoteInfo = info;
            }

            let user = await getUser();

            const _context: AppContext = {
                user: user,
                isAdministrator: (user.roles.indexOf(Role.Administrator) > -1) || false,
                isEditor: (user.roles.indexOf(Role.Editor) > -1) || false,
                // isAdministrator: false, 
                // isEditor: false,
                isEmployee: (user.roles.indexOf(Role.Employee) > -1) || false,
                editMode: false,
                readGroups: [],
                writeGroups: [],
            }
            if (remoteInfo) {
                _context.remoteInfo = remoteInfo;
            }
            if (info) {
                _context.info = info;
            }
            console.log("Original context=", JSON.stringify(_context, null, 4))
            console.log("Authenticated user =", user);
            setContext(_context);
        }
        run();
    }, []);

    function updateContext(ctx: any) {
        console.log("updateContext: ctx=", ctx);
        console.log("existing __context=", __context);
        if (ctx.user) {
            const user = ctx.user;
            console.log("New user info=", user);
            // Update existing context with new user details
            const _context: AppContext = {
                ...__context,
                user: user,
                isAdministrator: (user.roles.indexOf(Role.Administrator) > -1) || false,
                isEditor: (user.roles.indexOf(Role.Editor) > -1) || false,
                isEmployee: (user.roles.indexOf(Role.Employee) > -1) || false,
                editMode: false,
                readGroups: [],
                writeGroups: [],
            };
            setContext(_context);
        }
    }

    async function getUser(): Promise<User> {
        console.log("getUser()")
        try {
            const accessToken = getCookie("dlms.session").split(".")[1];
            const claims = JSON.parse(Buffer.from(accessToken, 'base64').toString());
            console.log("claims=", JSON.stringify(claims, null, 4));
            let user: User = {
                id: claims.user.id,
                name: claims.user.name,
                roles: claims.user.roles,
                department: claims.user.department,
                email: claims.user.email,
                title: claims.user.title,
                employeeNumber: claims.user.employeeNumber,
            };

            const http = Http.getInstance();
            if (claims.oauth?.accessToken) {
                http.accessToken = claims.oauth.accessToken;
            }

            // @NOTE: This is needed, since setting from HTTP is too late to set in app context
            // Get roles from ODS server
            if (process.env.REACT_APP_ODS_SERVER) {
                try {
                    const r = await http.get(`${process.env.REACT_APP_ODS_SERVER}/api/roles`);
                    const data = r.data;
                    console.log("roles=", data);
                    if (Array.isArray(data)) {
                        user.roles = [...user.roles, ...data];
                    }
                } catch (e) {
                    console.log("Error getting status");
                }
            }

            return user;
        } catch (e) {
            console.log("ERROR: ", e)
            console.log("No cookie set - check for no-auth-user from server");
            // Make any ajax call to get no-auth-user header from server
            try {
                const http = Http.getInstance();
                const response = await http.get("/api/info");
                if (response.headers["no-auth-user"]) {
                    try {
                        const ctx = JSON.parse(response.headers["no-auth-user"]);
                        console.log("no-auth-user ctx=", ctx);
                        let user = ctx.user;
                        return user;
                    } catch (e) {
                        console.log("Error parsing no-auth-user");
                    }
                }
            } catch (e) {
                console.log("Error getting no-auth-user");
            }
        }
        console.warn("No user - using default user");
        return defaultUser;
    }

    async function getInfo() {
        try {
            const http = Http.getInstance();
            const response = await http.get(`/api/info`);
            console.log("getInfo: ", response.data);
            return response.data;
        } catch (e) {
            console.log("Error getting info");
        }
    }

    async function getRemoteInfo() {
        try {
            const http = Http.getInstance();
            const response = await http.get(`${process.env.REACT_APP_ODS_SERVER || ""}/api/info`);
            console.log("getInfo: ", response.data);
            return response.data;
        } catch (e:any) {
            console.log("Error getting info: ", e);
            // if (e.status == 401) {
                console.log("Need to reauthenticate");
                window.location.href = "/login"
            // }
        }
    }


    const [showDialog, _setShowDialog] = useState<AlertPopupSettings | null>(null);
    const setShowDialog = async (obj: AlertPopupSettings | null) => {
        _setShowDialog(obj);
    }

    function getMessageFromError(err: any) {
        let msg = err.message;
        const i = msg.toLowerCase().indexOf("error:");
        if (i > -1) {
            msg = msg.substring(i+6).trim();
        }
        return msg;
    }

    useEffect(() => {
        if (context) {
            console.log("########## CONTEXT CHANGED =", JSON.stringify(context, null, 4));
            context.setShowDialog = setShowDialog;

            const showErrorPopup = async (err: any) => {
                console.trace("showErrorDialog: ", err);
                console.log("context=", context);
                if (context.setShowDialog) {
                    await context.setShowDialog({ title: err.statusText || "Error", text: buildMessageFromValidationError(err) });
                }
            }
            context.showErrorDialog = showErrorPopup;
        }
        __context = context;
    }, [context]);

    window.addEventListener("error", (err: any) => {
        console.log("Handled error in 'error' handler", err);
        // showErrorPopup(err);
        console.log("errorHandler =", errorHandler)
        if (errorHandler) {
            errorHandler(err)
        }
        else {
            setShowDialog({ title: err.statusText || "Error", text: getMessageFromError(err) });
        }
    });
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
        console.log("Handled error in 'unhandledrejection' handler", event);
        if (errorHandler) {
            errorHandler(event.reason)
        }
        else {
            setShowDialog({ title: event.reason.statusText || "Error", text: buildMessageFromError(event.reason) });
        }
    });

    // Global error handler
    window.onerror = function (message, source, lineno, colno, error) {
        console.error('GLOBAL Caught Error:', error);
        if (errorHandler) {
            errorHandler(error)
        }

        // Return true to prevent the default browser error handling
        return true;
    };

    const buildMessageFromValidationError = (err: any): string => {
        console.log("HERE err=", err)
        console.log("type=", (typeof err.message))
        if (err?.status === 422 && err.message?.includes("instancePath")) {
            try {
                const messages = JSON.parse(err.message);
                let builtMessage = "";
                for (const param of messages) {
                    console.log("param=", param);
                    let invalidParam = "";
                    if (param.keyword == "additionalProperties") {
                        invalidParam = param.params.additionalProperty;
                    }
                    else if (param.keyword == "required") {
                        invalidParam = param.params.missingProperty;
                    }
                    else {
                        const index = param.instancePath.lastIndexOf("/");
                        invalidParam = index !== -1 ? param.instancePath.substring(index + 1) : param.instancePath;
                    }
                    const value = param.message;
                    builtMessage += `${invalidParam}:\t${value}\n`;
                }
                return builtMessage;
            } catch (e) {
            }
        }
        return err.message;
    }

    const buildMessageFromError = (err: any): string => {
        if (!err || typeof err !== "object") return "";
        if (err.details) {
            const details = Object.keys(err.details);
            // DocError objects created from a ValidationError generated
            //  by tsoa can have details
            if (details.length > 0 && err.status && err.status === 422) {
                let builtMessage = "";
                for (const detail of details) {
                    // Each detail is an object with a message and a value.
                    //  These represent the validation error message and
                    //  the value that was determined to be unacceptable.
                    const value = err.details[detail].message;
                    const dotIndex = detail.lastIndexOf(".");
                    let invalidParam = dotIndex !== -1 ? detail.substring(dotIndex + 1) : detail;
                    if (value && invalidParam) {
                        if (err.labels) {
                            // if the UI wrapping the error has registered
                            //  a label to substitute for the invalid
                            //  property, make the substitution here
                            invalidParam = err.labels[invalidParam];
                        }
                        builtMessage += `${invalidParam}:\t${value}\n`;
                    }
                }
                return builtMessage;
            }            
        }
        if (err.message) {
            return buildMessageFromValidationError(err);
        }
        return "";
    }

    const _themes = themes();

    return (
        <ThemeProvider theme={(_themes as any)["light"]}>
            <Router>
                <div className="App">
                    <AlertPopup showDialog={showDialog} setShowDialog={setShowDialog} />
                    {context && <Routes>
                        <Route path="/" element={<Navigate replace to="/list" />} />
                        <Route path="/list" element={<DocumentListPage context={context} />} />
                        <Route path="/mostused" element={<MostUsedListPage context={context} />} />
                        <Route path="/toplevel" element={<TopLevelListPage context={context} />} />
                        <Route path="/serverscript" element={<ScriptsListPage context={context} type={"user"} />} />
                        <Route path="/serverscript/:id" element={<ScriptEditor context={context} type={"user"} />} />
                        <Route path="/adminscript" element={<ScriptsListPage context={context} type={"admin"} />} />
                        <Route path="/adminscript/:id" element={<ScriptEditor context={context} type={"admin"} />} />
                        <Route path="/notebook" element={<NotebooksListPage context={context} />} />
                        <Route path="/notebook/:id" element={<NotebookEditor context={context} />} />
                        <Route path="/page/:id" element={<PageRenderPage context={context} />} />
                        <Route path="/page" element={<PagesListPage context={context} />} />
                        <Route path="/pageedit/:id" element={<PagesEditor context={context} />} />
                        <Route path="/details/:id" element={<DocumentDetailsPage context={context} />} />
                        <Route path="/versions/:id" element={<VersionsListPage context={context} />} />
                        <Route path="/admin/" element={<AdminPage context={context} />} />
                        <Route path="/logs/" element={<LogsPage context={context} />} />
                        <Route path="/endoflife" element={<EndoflifeListPage context={context} />} />
                        <Route path="/endoflife/:id" element={<EndoflifeDetailsPage context={context} />} />
                        <Route path="/libraries" element={<LibrariesListPage context={context} />} />
                        <Route path="/test/" element={<TestPage context={context} />} />
                        <Route path="/help/" element={<HelpPage context={context} />} />
                        <Route path="/import/" element={<ImportPage context={context} />} />
                        <Route path="/etl" element={<EtlPage context={context} />} />
                        <Route path="/etllogs" element={<EtlLogsPage context={context} />} />
                        <Route path="*" element={<Navigate replace to="/list" />} />
                    </Routes>}
                </div>
            </Router>
        </ThemeProvider>
    )
}

export default App;
