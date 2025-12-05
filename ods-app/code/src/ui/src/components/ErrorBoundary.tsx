/**
 * Copyright (c) 2025 Capital One
*/

import { Button } from "@mui/material";
import React from "react";

interface ErrorState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component {
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
        return { hasError: true };
    }

    componentDidCatch(error:any, errorInfo:any) {
        // You can also log the error to an error reporting service
        this.error = error;
        console.log(">>> componentDidCatch: ", JSON.stringify(error));
    }

    render() {
        console.log(">>> getDerivedStateFromError: render()");
        if (this.state.hasError) {
            return (
                <div style={{textAlign:"center", paddingTop:"40px"}}>
                    <h3>Error displaying data {this.error}</h3>
                    <Button onClick={()=> {window.location.reload()}}>Reload page</Button>
                </div>
            )
        }
        return this.props.children; 
    }
}