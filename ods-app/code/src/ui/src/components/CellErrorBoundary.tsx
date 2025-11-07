/**
 * Copyright (c) 2025 Capital One
*/

import React from "react";
import { getErrorHandler } from "../App";

interface ErrorState {
    hasError: boolean;
}

let err:any;

export class CellErrorBoundary extends React.Component {
    state: ErrorState;
    props: any;
    error: any;

    constructor(props:any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error:any) {
        // Update state so the next render will show the fallback UI.
        console.log(">>> getDerivedStateFromError: hasError=true: error=", error);
        err = error;
        return { hasError: true };
    }

    componentDidCatch(error:any, errorInfo:any) {
        // You can also log the error to an error reporting service
        this.error = error;
        console.log(">>> componentDidCatch: ", JSON.stringify(error));
    }

    render() {
        if (this.state.hasError) {
            console.log(">>> getDerivedStateFromError: render error()");
            const errorHandler = getErrorHandler();
            if (errorHandler && err) {
                const r = errorHandler(err);
                this.state.hasError = false;
                return (
                    <pre>{r}</pre>
                )
            }
            if (this.props.errorMessage) {
                return (this.props.errorMessage)
            }
            return (
                <div style={{textAlign:"center", paddingTop:"40px"}}>
                    <h3>Error in cell</h3>
                    <code>{JSON.stringify(this.error,null,4)}</code>
                </div>
            )
        }
        return this.props.children; 
    }
}