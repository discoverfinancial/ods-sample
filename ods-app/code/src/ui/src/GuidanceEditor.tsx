/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState } from 'react';
import { Button, InputLabel, TextField, Grid, Modal, Box, IconButton, Snackbar, Alert, Select, MenuItem, Card, Tooltip, Accordion, AccordionSummary, AccordionDetails, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, styled, Paper } from '@mui/material'
import { DocMgr } from "./managers/DocMgr";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


import { GuidanceInfo, GuidanceUpdate, GuidanceDocumentation, GuidanceAlternative, guidanceType, GuidanceReference } from './common';
import { GuidanceMgr } from './managers/GuidanceMgr';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { AppContext, capitalize, chooseHighestRole, formatDate } from './common';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';;

const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px"
};

interface Props {
    context: AppContext;
    guidance: GuidanceInfo;
    documentId: GuidanceReference;
    setGuidance: any;
    defaultVersion?: string;
    versions?: string[];
}

const GuidanceEditor: React.FC<Props> = ({ context, guidance, setGuidance, documentId, defaultVersion, versions }) => {
    const guidanceMgr = GuidanceMgr.getInstance();
    const titleRef = React.useRef();
    const docMgr = DocMgr.getInstance();

    const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
    const [showRetireModal, setShowRetireModal] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false)
    const [showActivation, setShowActivation] = useState<boolean>(false)
    const [showError, setShowError] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showTitleError, setShowTitleError] = useState<boolean>(false);
    const [showMinValueError, setShowMinValueError] = useState<boolean>(false);
    const [allowTitleEdit, setAllowTitleEdit] = useState<boolean>(false);
    const [allowVersionEdit, setAllowVersionEdit] = useState<boolean>(false);
    const [allowOverviewEdit, setAllowOverviewEdit] = useState<boolean>(false);
    const [guidanceOverviewShowMore, setGuidanceOverviewShowMore] = useState<boolean>(false);

    async function onPciChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("pci changed: ", value);
        const _guidance = { ...guidance }
        if (!_guidance.hasOwnProperty("pci")) {
            _guidance.pci = { preferredVersion: { minimum: value } }
        }
        else {
            (_guidance as any).pci.preferredVersion = { minimum: value };
        }
        setGuidance(_guidance);
        setShowMinValueError(!value && !_guidance.nonPci?.preferredVersion.minimum)
    }

    async function onNonPciChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("nonPci changed: ", value);
        const _guidance = { ...guidance }
        if (!_guidance.hasOwnProperty("nonPci")) {
            _guidance.nonPci = { preferredVersion: { minimum: value } }
        }
        else {
            (_guidance as any).nonPci.preferredVersion = { minimum: value };
        }
        setGuidance(_guidance);
        setShowMinValueError(!value && !_guidance.pci?.preferredVersion.minimum)
    }

    async function onTitleChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("title changed: ", value);
        const _guidance = { ...guidance }
        _guidance.title = value;
        setGuidance(_guidance);
        setShowTitleError(!value);
    }

    async function setupErrorLabels(err: any) {
        // setup error labels where the key is the object property
        //  and the value is the UI label text associated with the
        //  field linked to the object property
        err.labels = {
            title: "Guidance Title",
            tier: "Tier",
            description: "Description",
            name: "Name",
            details: "Details",
            url: "URL",
        }
    }

    async function onTitleSaved(event: any): Promise<any> {
        if (!guidance.title) {
            setShowTitleError(true);
            if (titleRef.current) {
                (titleRef.current as HTMLInputElement).focus();
            }
            return;
        }
        if (showTitleError) {
            setShowTitleError(false);
        }
        const _guidance = { ...guidance }
        try {
            const newGuidance = await guidanceMgr.saveDocument(_guidance, "title");
            setGuidance(newGuidance);
            setShowSuccess(true)
        } catch (e: any) {
            setupErrorLabels(e);
            throw e;
        }
        setAllowTitleEdit(false);
    }

    async function onOverviewSaved(event: any): Promise<any> {
        const _guidance = { ...guidance }
        try {
            const newGuidance = await guidanceMgr.saveDocument(_guidance, "description,documentation,alternatives");
            setGuidance(newGuidance);
            setShowSuccess(true)
        } catch (e: any) {
            setupErrorLabels(e);
            throw e;
        }
        setAllowOverviewEdit(false);
    }

    async function onDescriptionChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("description changed: ", value);
        const _guidance = { ...guidance }
        _guidance.description = value;
        setGuidance(_guidance);
    }

    async function onTierChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("tier changed: ", value);
        const _guidance = { ...guidance }
        _guidance.tier = value;
        if (value == "2" && versions) {
            _guidance.depsdevVersions = versions;
            const version = versions?.[parseInt(_guidance.nMinus || "2")]
            console.log("version=", version);
            if (version) {
                if (!_guidance.hasOwnProperty("pci")) {
                    _guidance.pci = { preferredVersion: { minimum: version } }
                }
                else {
                    (_guidance as any).pci.preferredVersion = { minimum: version };
                }
                if (!_guidance.hasOwnProperty("nonPci")) {
                    _guidance.nonPci = { preferredVersion: { minimum: version } }
                }
                else {
                    (_guidance as any).nonPci.preferredVersion = { minimum: version };
                }
            }
        }
        else {
            delete _guidance.depsdevVersions;
        }
        setGuidance(_guidance);
    }

    async function handleShowGuidanceHistory(): Promise<any> {
        console.log("show guidance history: ", (guidance as any).name);
        window.open("/guidance/history/" + encodeURIComponent(JSON.stringify(documentId)), "_self")?.focus();
    }

    async function nMinusChanged(event: any): Promise<any> {
        const value = event.target.value;
        console.log("nMinus changed: ", value);
        const _guidance = { ...guidance }
        _guidance.nMinus = value;
        const version = versions?.[value]
        console.log("version=", version);
        if (version) {
            if (!_guidance.hasOwnProperty("pci")) {
                _guidance.pci = { preferredVersion: { minimum: version } }
            }
            else {
                (_guidance as any).pci.preferredVersion = { minimum: version };
            }
            if (!_guidance.hasOwnProperty("nonPci")) {
                _guidance.nonPci = { preferredVersion: { minimum: version } }
            }
            else {
                (_guidance as any).nonPci.preferredVersion = { minimum: version };
            }
        }
        setGuidance(_guidance);
    }

    async function onDocumentationChanged(prop: string, value: string, index: number): Promise<any> {
        console.log(prop + " changed: ", value);
        const _guidance = { ...guidance }
        if (!_guidance.documentation) {
            _guidance.documentation = [{ title: "", details: "", url: "" }];
        }
        (_guidance as any).documentation[index][prop] = value;
        setGuidance(_guidance);
    }

    async function onAlternativesChanged(prop: string, value: string, index: number): Promise<any> {
        console.log(prop + " changed: ", value);
        const _guidance = { ...guidance }
        if (!_guidance.alternatives) {
            _guidance.alternatives = [{ name: "", details: "", url: "" }];
        }
        (_guidance as any).alternatives[index][prop] = value;
        setGuidance(_guidance);
    }

    async function onSaveClicked(event: any): Promise<any> {
        if (!guidance.title) {
            setShowTitleError(true);
            if (titleRef.current) {
                (titleRef.current as HTMLInputElement).focus();
            }
            return;
        }
        if (showTitleError) {
            setShowTitleError(false);
        }
        const _guidance = { ...guidance }
        delete (_guidance as GuidanceUpdate).state; // No change of state
        try {
            if (guidance.state == "created") {
                await guidanceMgr.saveDocument(_guidance);
            }
            else {
                const newGuidance = await guidanceMgr.createDocument(_guidance);
                setGuidance(newGuidance);
            }
            setShowSuccess(true)
        } catch (e: any) {
            setupErrorLabels(e);
            throw e;
        }
    }

    async function onPreActivateClicked(event: any): Promise<any> {
        await onSaveClicked(event);
        setShowActivateModal(true);
    }

    async function onPreActivateClicked2(event: any): Promise<any> {
        setShowActivateModal(true);
    }

    async function onActivateClicked(event: any): Promise<any> {
        const _guidance = { ...guidance }

        try {
            const cancelResp = await docMgr.runAction(guidanceType, _guidance, { action: "cancelAllGuidances" });
            console.log("cancelResp: ", cancelResp);

            if (_guidance.state == "active") {
                const newGuidance = await guidanceMgr.createDocument(_guidance);
                if (newGuidance) {
                    newGuidance.state = "active";
                    setGuidance(newGuidance);
                    await guidanceMgr.saveDocument(newGuidance, "state");
                    const updateResp = await docMgr.runAction(guidanceType, newGuidance, { action: "updateAttestations" });
                    console.log("updateResp: ", updateResp);
                }
            } else {
                _guidance.state = "active";
                setGuidance(_guidance);
                const updateResp = await docMgr.runAction(guidanceType, _guidance, { action: "updateAttestations" });
                console.log("updateResp: ", updateResp);
                await guidanceMgr.saveDocument(_guidance, "state");
            }
            setShowActivation(true)
            window.location.reload();
        } catch (e: any) {
            setupErrorLabels(e);
            throw e;
        }
    }

    async function onCancelClicked(event: any): Promise<any> {
        const _guidance = { ...guidance }
        await guidanceMgr.deleteDocument(_guidance.id);
        window.location.reload();
    }

    const renderDocumentationRow = (row: GuidanceDocumentation, index: number) => {
        const allowEdit = guidance.state == "created" || allowOverviewEdit
        return (
            <Grid container className="spacer detailQuestion" spacing={3}
                style={{ display: ((context.editMode && allowEdit) ? "flex" : "block") }}
            >
                <Grid item md={3}>
                    {(context.editMode && allowEdit) &&
                        <TextField
                            id={"editor-doc-title"}
                            value={row.title || ""}
                            onChange={(event) => { onDocumentationChanged("title", event.target.value, index) }}
                            label="TITLE"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                }
                            }}
                        />}
                    {!(context.editMode && allowEdit) &&
                        <>
                            <div className='label-2'>
                                TITLE
                            </div>
                            <div className='body1 spacer-top-1'>
                                {row.title}
                            </div>
                        </>}
                </Grid>
                {((context.editMode && allowEdit) || row.details) && <Grid item md={4}>
                    {(context.editMode && allowEdit) &&
                        <TextField
                            id={"editor-doc-details"}
                            value={row.details || ""}
                            onChange={(event) => { onDocumentationChanged("details", event.target.value, index) }}
                            label="DETAILS"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                    padding: "0px",
                                }
                            }}
                        />}
                    {!(context.editMode && allowEdit) && row.details &&
                        <>
                            <div className='label-2'>
                                DETAILS
                            </div>
                            <div className='body1 spacer-top-1'>
                                {row.details}
                            </div>
                        </>}
                </Grid>}
                <Grid item md={4}>
                    {(context.editMode && allowEdit) && <TextField
                        id={"editor-doc-url"}
                        value={row.url || ""}
                        onChange={(event) => { onDocumentationChanged("url", event.target.value, index) }}
                        label="URL"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            width: "100%",
                            ".MuiInputBase-multiline": {
                                padding: "0px",
                            }
                        }}
                    />}
                    {!(context.editMode && allowEdit) &&
                        <>
                            <div className='label-2'>URL</div>
                            <div className='link spacer-top-1'>
                                <a href={row.url} target="_blank" rel="noreferrer">{row.url}</a>
                            </div>
                        </>}
                </Grid>
                {(context.editMode && allowEdit) &&
                    <Grid item xs={1}>
                        <IconButton size='small' onClick={() => onDeleteDocumentation(index)} aria-label="delete documentation entry">
                            <DeleteIcon />
                        </IconButton>
                    </Grid>}
            </Grid>
        )
    }

    const onAddDocumentation = () => {
        const _guidance = { ...guidance }
        if (!_guidance.documentation) {
            _guidance.documentation = [];
        }
        _guidance.documentation.push({ title: "", details: "", url: "" });
        setGuidance(_guidance);
    }

    const onDeleteDocumentation = (index: number) => {
        const _guidance = { ...guidance }
        _guidance.documentation?.splice(index, 1);
        setGuidance(_guidance);
    }

    const renderAlternativesRow = (row: GuidanceAlternative, index: number) => {
        const allowEdit = guidance.state == "created" || allowOverviewEdit
        return (
            <Grid container className="spacer detailQuestion" spacing={3}
                style={{ display: ((context.editMode && allowEdit) ? "flex" : "block") }}
            >
                <Grid item md={3}>
                    {(context.editMode && allowEdit) &&
                        <TextField
                            id={"editor-alt-name"}
                            value={row.name || ""}
                            onChange={(event) => { onAlternativesChanged("name", event.target.value, index) }}
                            label="ALTERNATIVE PRODUCT NAME"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                    padding: "0px",
                                }
                            }}
                        />}
                    {!(context.editMode && allowEdit) &&
                        <>
                            <div className='label-2'>
                                ALTERNATIVE PRODUCT NAME
                            </div>
                            <div className='body2 spacer-top-1'>
                                {row.name}
                            </div>
                        </>}
                </Grid>
                <Grid item md={4}>
                    {(context.editMode && allowEdit) &&
                        <TextField
                            id={"editor-alt-details"}
                            value={row.details || ""}
                            onChange={(event) => { onAlternativesChanged("details", event.target.value, index) }}
                            label="PRODUCT DETAILS"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                    padding: "0px",
                                }
                            }}
                        />}
                    {!(context.editMode && allowEdit) &&
                        <>
                            <div className='label-2'>
                                PRODUCT DETAILS
                            </div>
                            <div className='body2 spacer-top-1'>
                                {row.details}
                            </div>
                        </>}
                </Grid>
                <Grid item md={4}>
                    {(context.editMode && allowEdit) &&
                        <TextField
                            id={"editor-alt-url"}
                            value={row.url || ""}
                            onChange={(event) => { onAlternativesChanged("url", event.target.value, index) }}
                            label="URL"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                    padding: "0px",
                                }
                            }}
                        />}
                    {!(context.editMode && allowEdit) &&
                        <>
                            <div className='label-2'>URL</div>
                            <div className='link spacer-top-1'>
                                <a href={row.url} target="_blank" rel="noreferrer">{row.url}</a>
                            </div>
                        </>}
                </Grid>
                {(context.editMode && allowEdit) &&
                    <Grid item xs={1}>
                        <IconButton size='small' onClick={() => onDeleteAlternatives(index)} aria-label="delete alternatives entry">
                            <DeleteIcon />
                        </IconButton>
                    </Grid>}
            </Grid>
        )
    }

    const renderOtherDetails = () => {
        return (
            <Accordion
                style={{ border: "none", padding: "4px", margin: "0px", boxShadow: "none" }}
                sx={{
                    "& svg path": {
                        fill: "unset",
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                >
                    <div>
                        <b>Other Details</b>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div>
                        <Card
                            sx={{
                                background: "#ECEFF1",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                boxShadow: "none",
                                border: "none",
                                gap: "10%",
                                borderRadius: "16px"
                            }}
                        >
                            <div>
                                <div className='label-1'>
                                    Guidance Status
                                </div>
                                <div style={{ paddingTop: "8px", display: "flex", gap: "8px" }}>
                                    {(guidance.state == 'active') && <CheckCircleOutlineIcon color="success" />}
                                    {(guidance.state == 'created') && <EditAttributesIcon color="primary" />}
                                    {(guidance.state == 'closed') && <HighlightOffIcon color="error" />}
                                    {(guidance.state == 'canceled') && <BlockIcon color="error" />}
                                    <div style={{ top: "4px", position: "relative" }}>
                                        {capitalize(guidance.state)}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='label-1'>
                                    Latest Update
                                </div>
                                <div style={{ paddingTop: "8px", top: "4px", position: "relative" }}>
                                    {formatDate(guidance.dateUpdated)}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className='spacer'>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead sx={{ display: "table-header-group", background: "#ECEFF1" }}>
                                    <TableRow>
                                        <TableCell width={"20%"}><h6>Date</h6></TableCell>
                                        <TableCell width={"20%"}><h6>Changes By</h6></TableCell>
                                        <TableCell width={"20%"}><h6>Change</h6></TableCell>
                                        <TableCell width={"20%"}><h6>Role</h6></TableCell>
                                        <TableCell width={"20%"}><h6>Email</h6></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {guidance.updatedBy.map((update, index) => {
                                        if (index > 1 && !guidanceOverviewShowMore) {
                                            return
                                        }
                                        return (
                                            <StyledTableRow
                                                key={update.date}
                                            >
                                                <TableCell component="th" scope="row">{formatDate(update.date)}</TableCell>
                                                <TableCell component="th" scope="row">{update.user.name}</TableCell>
                                                {index == 0 && <TableCell component="th" scope="row">Created</TableCell>}
                                                {index != 0 && <TableCell component="th" scope="row">Update</TableCell>}
                                                <TableCell component="th" scope="row">{chooseHighestRole(update.user.roles)}</TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Button variant="text" onClick={() => { navigator.clipboard.writeText(update.user.email) }}>
                                                        <ContentCopyOutlinedIcon />
                                                    </Button>
                                                </TableCell>
                                            </StyledTableRow>
                                        )

                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {(guidance.updatedBy.length > 2) && <div className="spacer">
                            {guidanceOverviewShowMore && <a onClick={() => setGuidanceOverviewShowMore(false)}>Show less</a>}
                            {!guidanceOverviewShowMore && <a onClick={() => setGuidanceOverviewShowMore(true)}>Show more</a>}
                        </div>}
                    </div>
                </AccordionDetails>
            </Accordion>
        )
    }

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: "#FAFAFA",
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const onAddAlternatives = () => {
        const _guidance = { ...guidance }
        if (!_guidance.alternatives) {
            _guidance.alternatives = [];
        }
        _guidance.alternatives.push({ name: "", details: "", url: "" });
        setGuidance(_guidance);
    }

    const onDeleteAlternatives = (index: number) => {
        const _guidance = { ...guidance }
        _guidance.alternatives?.splice(index, 1);
        setGuidance(_guidance);
    }

    const requiredValuesProvided = () => {
        if (!guidance.title) {
            return false;
        }
        if (!guidance.pci?.preferredVersion.minimum && !guidance.nonPci?.preferredVersion.minimum) {
            return false;
        }
        return true;
    }

    async function onCreateGuidance(event: any): Promise<any> {
        const _guidance = await guidanceMgr.createDocument({
            item: { name: documentId.name, basePurl: documentId.basePurl },
            tier: "1",
            title: "Guidance for " + documentId.basePurl,
        })
        console.log("guidance=", _guidance);
        if (_guidance) {
            setGuidance(_guidance);
        }
    }

    async function onRetireGuidance(event: any): Promise<any> {
        const _guidance = { ...guidance }
        _guidance.state = "cancelled";
        await guidanceMgr.saveDocument(_guidance, "state");
        console.log("guidance=", _guidance);
        if (_guidance) {
            setGuidance(_guidance);
        }
        window.location.reload();
    }

    return (
        <div style={{ width: "70%", maxWidth: "1500px", minWidth: "550px" }}>
            <Modal open={showActivateModal} onClose={() => setShowActivateModal(false)}>
                <Box sx={modalStyle}>
                    <div className='modal-content'>
                        <h3>{guidance.title}</h3>
                        <div className='body1'>
                            After activation, this guidance will trigger new attestations for product teams using <b>{guidance.item?.name}</b> with versions lower than:
                        </div>
                        <div className="spacer detailDiv" style={{ display: "flex", justifyContent: "space-between" }}>
                            {guidance.pci?.preferredVersion.minimum && <div className='body2 col-6'>PCI min version <br /><br /> <b>{guidance.pci?.preferredVersion.minimum}</b></div>}
                            {guidance.nonPci?.preferredVersion.minimum && <div className='body2 col-6'>Non PCI min version <br /><br /> <b>{guidance.nonPci?.preferredVersion.minimum}</b></div>}
                        </div>
                        <div className="spacer" style={{ display: "flex", gap: "20px", justifyContent: "left" }}>
                            <Button
                                onClick={onActivateClicked}
                                disabled={!guidance.title || (!guidance.pci?.preferredVersion.minimum && !guidance.nonPci?.preferredVersion.minimum)}
                            >
                                Activate Guidance
                            </Button>
                            <Button onClick={() => setShowActivateModal(false)} variant="text">Cancel</Button>
                        </div>
                    </div>
                </Box>
            </Modal>
            <Modal open={showRetireModal} onClose={() => setShowRetireModal(false)}>
                <Box sx={modalStyle}>
                    <div className='modal-content'>
                        <h3>Retire {guidance.title}</h3>
                        <div className='spacer-bottom-3'>
                            When a guidance is retired all the attestations associated with it are canceled.
                            <br /><br />
                            Do you want to retire <b>{guidance.title}</b> ?
                        </div>
                        <br />
                        <Grid container spacing={3}>
                            <Grid item xs={8}>
                                <Button sx={{ padding: "12px" }} onClick={onRetireGuidance}>
                                    Yes, Retire Guidance
                                </Button>
                            </Grid>
                            <Grid item md={3}>
                                <Button sx={{ padding: "12px" }} variant='text' onClick={() => setShowRetireModal(false)}>
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Box>
            </Modal>
            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={() => setShowSuccess(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    Guidance Saved
                </Alert>
            </Snackbar>
            <Snackbar open={showActivation} autoHideDuration={5000} onClose={() => setShowActivation(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    Guidance Activated
                </Alert>
            </Snackbar>
            <Snackbar open={showError} autoHideDuration={5000} onClose={() => setShowError(false)}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    {errorMessage || "Unknown Error"}
                </Alert>
            </Snackbar>

            {guidance.state == "created" && <div>
                <div className="spacer detailQuestion">
                    <InputLabel className='label-2 required'>Guidance Title</InputLabel>
                    {showTitleError &&
                        <div style={{ color: "#A01C2B", fontSize: "14px", marginLeft: "10px", marginTop: "10px" }}>
                            <ErrorIcon style={{ width: "12px", height: "12px" }} /> Guidance requires a title to be saved.
                        </div>}
                    {context.editMode && <TextField
                        id={"editor-title"}
                        inputRef={titleRef}
                        value={guidance.title}
                        onChange={onTitleChanged}
                        sx={{
                            width: "100%",
                            ".MuiInputBase-multiline": {
                                padding: "0px",
                            }
                        }}
                    />}
                    {!context.editMode && <div className='spacer-top-2'>{guidance?.title}</div>}
                    <br /><br />
                    <hr style={{ marginLeft: '0' }} />
                </div>
                <div className="spacer">
                    <Card
                        sx={{
                            background: "#ECEFF1",
                            display: "flex",
                            flexDirection: "row",
                            boxShadow: "none",
                            border: "none",
                            minHeight: "100px",
                            borderRadius: "16px"
                        }}
                    >
                        <div style={{ width: "20%" }}>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                <div className='label-1'>Tier</div>
                                {guidance.tier == "1" && <Tooltip title="Tier 1 Guidances are set manually" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                                {guidance.tier == "2" && <Tooltip title="Tier 2 Guidances are automatically set by the system" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                                {/* TODO: Need to define flow for other tier */}
                                {(!guidance.tier || !["1", "2"].includes(guidance.tier)) && <Tooltip title="Tier “Other” Guidances do not require versions to be set" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                            </div>
                            {context.editMode && <Select
                                sx={{ width: "60%", marginLeft: "24px", minWidth: "90px", position: "relative", top: "16px" }}
                                value={guidance.tier}
                                onChange={onTierChanged}
                            >
                                <MenuItem value={"1"}>1</MenuItem>
                                <MenuItem value={"2"}>2</MenuItem>
                                <MenuItem value={"Other"}>Other</MenuItem>
                            </Select>}
                            {!context.editMode && <div style={{ textAlign: "center", position: "relative", top: "22px" }} className='spacer-top-2'>{guidance?.tier}</div>}
                        </div>
                        {guidance.tier == "1" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "1" && <div style={{ width: "40%" }}>
                            <div className="label-1">PCI Minimum Version</div>
                            <div style={{ width: "80%", marginLeft: "10px" }}>
                                <div>
                                    {context.editMode && <TextField
                                        id={"editor-pci"}
                                        value={guidance.pci?.preferredVersion.minimum || ""}
                                        placeholder={defaultVersion ? defaultVersion : ""}
                                        onChange={onPciChanged}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: "80%",
                                            top: "13px",
                                            position: "relative",
                                            ".MuiInputBase-multiline": {
                                                padding: "0px",
                                            }
                                        }}
                                    />}
                                    <div>
                                        {showMinValueError &&
                                            <div style={{ color: "#A01C2B", fontSize: "14px", marginLeft: "10px", marginTop: "10px" }}>
                                                <ErrorIcon style={{ width: "12px", height: "12" }} />
                                                Add at least one min value for preferred PCI or non-PCI versions.
                                            </div>}
                                    </div>
                                    {!context.editMode && <div style={{ width: "80%", marginLeft: "30px", paddingTop: "42px" }} className='spacer-top-2'>{guidance?.pci?.preferredVersion.minimum}</div>}
                                </div>
                            </div>
                        </div>}

                        {guidance.tier == "1" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "1" && <div style={{ width: "40%" }}>
                            <div className="label-1">NonPCI Minimum Version</div>
                            <div style={{ width: "80%", marginLeft: "10px" }}>
                                {context.editMode && <TextField
                                    id={"editor-nonpci"}
                                    value={guidance.nonPci?.preferredVersion.minimum || ""}
                                    placeholder={defaultVersion ? defaultVersion : ""}
                                    onChange={onNonPciChanged}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        width: "80%",
                                        top: "13px",
                                        position: "relative",
                                        ".MuiInputBase-multiline": {
                                            padding: "0px",
                                        }
                                    }}
                                />}
                                {!context.editMode && <div style={{ width: "80%", marginLeft: "30px", paddingTop: "42px" }} className='spacer-top-2'>{guidance.nonPci?.preferredVersion.minimum}</div>}
                            </div>
                        </div>}

                        {guidance.tier == "2" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "2" &&
                            <div>
                                <div className='label-1'>Minimum Versions</div>
                                {context.editMode &&
                                    <div>
                                        <Select
                                            value={guidance?.nMinus || "2"}
                                            sx={{ width: "300px", top: "20px" }}
                                            onChange={nMinusChanged}
                                            disabled={!context.editMode}
                                        >
                                            {versions?.map((version, i) => {
                                                return (
                                                    <MenuItem key={"v" + i} value={"" + i} >
                                                        {i == 0 ? "N" : "N-" + i} - Version {version}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </div>}
                                {!context.editMode && <div className='spacer-top-2 body1' style={{ position: "relative", top: "25px" }}>
                                    {guidance.nMinus == "0" ? "N" : "N-" + (guidance.nMinus || "2")}  Version {versions ? versions[Number(guidance.nMinus || 2)] : "?"}
                                </div>}
                            </div>}
                    </Card>
                    <div className='spacer small'>
                        Preferred versions for Payment Card Industry (<b>PCI</b>) Compliance products might be different to preferred versions for products that don't require Payment Card Industry (<b>Non-PCI</b>) Compliance.
                    </div>
                </div>
                <br /><br />
                {renderOtherDetails()}
                <br />
                <hr style={{ marginLeft: '0' }} />
                <div className="spacer"></div>

                <h5>Guidance Overview</h5>
                <Grid container>
                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Description</InputLabel>
                        {context.editMode && <TextField
                            id={"editor-desc"}
                            value={guidance.description || ""}
                            multiline={true}
                            rows={4}
                            onChange={onDescriptionChanged}
                            sx={{
                                width: "100%",
                                ".MuiInputBase-multiline": {
                                    padding: "0px",
                                }
                            }}
                        />}
                        {!context.editMode && <div className='spacer-top-2'>{guidance?.description}</div>}
                    </Grid>

                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Enter Documentation</InputLabel>
                        <div className='body3'>Documentation helps product teams to implement the changes required for the software update.</div>
                        {guidance.documentation?.map((row, index) =>
                            renderDocumentationRow(row, index)
                        )}
                    </Grid>
                    {context.editMode && <div className="spacer">
                        <IconButton size='small' onClick={onAddDocumentation} aria-label="add documentation entry">
                            <AddCircleOutlineIcon />
                        </IconButton>
                        <a onClick={onAddDocumentation} style={{ paddingLeft: "16px" }}> Add Documentation</a>
                    </div>}

                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Enter Alternatives</InputLabel>
                        <div className='body3'>Alternative libraries could be used instead of the proposed update for this software.</div>
                        {guidance.alternatives?.map((row, index) =>
                            renderAlternativesRow(row, index)
                        )}
                    </Grid>
                    {context.editMode && <div className="spacer">
                        <IconButton size='small' onClick={onAddAlternatives} aria-label="add alternatives entry">
                            <AddCircleOutlineIcon />
                        </IconButton>
                        <a onClick={onAddAlternatives} style={{ paddingLeft: "16px" }}> Add Alternative</a>
                    </div>}

                    {context.editMode && <Grid item xs={12} className="spacer detailDiv" style={{ display: "flex", gap: "20px" }}>
                        <Button disabled={!requiredValuesProvided()} onClick={onPreActivateClicked}>Save and Activate</Button>
                        <Button onClick={onSaveClicked} variant='outlined'>Save for Later</Button>
                        <Button onClick={onCancelClicked} variant="outlined">Cancel</Button>
                    </Grid>}

                </Grid>

                <div className="spacer small">
                    * Save and activate triggers attestations for product teams using the guidance software<br />
                    ** Save for later saves the guidance to activate later<br />
                    *** Cancel does not save changes
                </div>
            </div>}

            {guidance.state == "active" && <div>
                <div className="spacer detailQuestion">
                    {showTitleError &&
                        <div style={{ color: "#A01C2B", fontSize: "14px", marginLeft: "10px", marginTop: "10px" }}>
                            <ErrorIcon style={{ width: "12px", height: "12px" }} /> Guidance requires a title to be saved.
                        </div>}
                    {(context.editMode && allowTitleEdit) &&
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "20px" }}>
                            <TextField
                                id={"editor-title"}
                                inputRef={titleRef}
                                value={guidance.title}
                                onChange={onTitleChanged}
                                sx={{
                                    width: "70%",
                                    ".MuiInputBase-multiline": {
                                        padding: "0px",
                                    }
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: "right", gap: "16px" }}>
                                <Button
                                    variant='outlined'
                                    onClick={onTitleSaved}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant='outlined'
                                    onClick={() => setAllowTitleEdit(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>}
                    {!(context.editMode && allowTitleEdit) &&
                        <div className='spacer-top-2' style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", gap: "24px" }}>
                            <h3>{guidance?.title}</h3>
                            {context.editMode &&
                                <Button
                                    sx={{ top: "12px" }}
                                    variant='outlined'
                                    onClick={() => setAllowTitleEdit(true)}
                                >
                                    Edit
                                </Button>}
                        </div>}
                    <hr style={{ marginLeft: '0' }} />
                </div>
                <div className="spacer">
                    <Card
                        sx={{
                            background: "#ECEFF1",
                            display: "flex",
                            flexDirection: "row",
                            boxShadow: "none",
                            border: "none",
                            minHeight: "100px",
                            borderRadius: "16px"
                        }}
                    >
                        <div style={{ width: "20%", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                <div className="label-1">Tier</div>
                                {guidance.tier == "1" && <Tooltip title="Tier 1 Guidances are set manually" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                                {guidance.tier == "2" && <Tooltip title="Tier 2 Guidances are automatically set by the system" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                                {/* TODO: Need to define flow for other tier */}
                                {(!guidance.tier || !["1", "2"].includes(guidance.tier)) && <Tooltip title="Tier “Other” Guidances do not require versions to be set" placement="top" arrow>
                                    <InfoIcon />
                                </Tooltip>}
                            </div>
                            {(context.editMode && allowVersionEdit) &&
                                <Select
                                    sx={{ width: "60%", minWidth: "90px", position: "relative", top: "16px" }}
                                    value={guidance.tier}
                                    onChange={onTierChanged}
                                >
                                    <MenuItem value={"1"}>1</MenuItem>
                                    <MenuItem value={"2"}>2</MenuItem>
                                    <MenuItem value={"Other"}>Other</MenuItem>
                                </Select>}

                            {!(context.editMode && allowVersionEdit) &&
                                <div style={{ textAlign: "center", position: "relative", top: "22px" }} className='spacer-top-2'>
                                    {guidance?.tier}
                                </div>}
                        </div>
                        {guidance.tier == "1" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "1" && <div style={{ width: "40%" }}>
                            <div className="label-1">PCI Minimum Version</div>
                            <div style={{ width: "80%", marginLeft: "10px" }}>
                                <div>
                                    {(context.editMode && allowVersionEdit) &&
                                        <TextField
                                            id={"editor-pci"}
                                            value={guidance.pci?.preferredVersion.minimum || ""}
                                            onChange={onPciChanged}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{
                                                width: "80%",
                                                top: "13px",
                                                position: "relative",
                                                ".MuiInputBase-multiline": {
                                                    padding: "0px",
                                                }
                                            }}
                                        />}
                                    <div>
                                        {showMinValueError &&
                                            <div style={{ color: "#A01C2B", fontSize: "14px", marginLeft: "10px", marginTop: "10px" }}>
                                                <ErrorIcon style={{ width: "12px", height: "12" }} />
                                                Add at least one min value for preferred PCI or non-PCI versions.
                                            </div>}
                                    </div>
                                    {!(context.editMode && allowVersionEdit) &&
                                        <div style={{ width: "80%", marginLeft: "30px", paddingTop: "42px" }} className='spacer-top-2'>
                                            {guidance?.pci?.preferredVersion.minimum}
                                        </div>}
                                </div>
                            </div>
                        </div>}

                        {guidance.tier == "1" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "1" && <div style={{ width: "40%" }}>
                            <div className="label-1">NonPCI Minimum Version</div>
                            <div style={{ width: "80%", marginLeft: "10px" }}>

                                {(context.editMode && allowVersionEdit) &&
                                    <TextField
                                        id={"editor-nonpci"}
                                        value={guidance.nonPci?.preferredVersion.minimum || ""}
                                        onChange={onNonPciChanged}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: "80%",
                                            top: "13px",
                                            position: "relative",
                                            ".MuiInputBase-multiline": {
                                                padding: "0px",
                                            }
                                        }}
                                    />}
                                {!(context.editMode && allowVersionEdit) &&
                                    <div style={{ width: "80%", marginLeft: "30px", paddingTop: "42px" }} className='spacer-top-2'>
                                        {guidance.nonPci?.preferredVersion.minimum}
                                    </div>}
                            </div>
                        </div>}

                        {guidance.tier == "2" && <hr style={{ width: "0", minHeight: "100%", maxHeight: "100vh", margin: 0 }} />}
                        {guidance.tier == "2" &&
                            <div>
                                <div className='label-1'>Minimum Versions</div>
                                {(context.editMode && allowVersionEdit) &&
                                    <div>
                                        <Select
                                            value={guidance?.nMinus || "2"}
                                            sx={{ width: "300px", top: "20px" }}
                                            onChange={nMinusChanged}
                                            disabled={!context.editMode}
                                        >
                                            {versions?.map((version, i) => {
                                                return (
                                                    <MenuItem key={"v" + i} value={"" + i} >
                                                        {i == 0 ? "N" : "N-" + i} - Version {version}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </div>}
                                {!(context.editMode && allowVersionEdit) && <div className='spacer-top-2 body1' style={{ position: "relative", top: "25px" }}>
                                    {guidance.nMinus == "0" ? "N" : "N-" + (guidance.nMinus || "2")}  Version {versions ? versions[Number(guidance.nMinus || 2)] : "?"}
                                </div>}
                            </div>}

                    </Card>
                    <div className='spacer small'>
                        Preferred versions for Payment Card Industry (<b>PCI</b>) Compliance products might be different to preferred versions for products that don't require Payment Card Industry (<b>Non-PCI</b>) Compliance.
                    </div>
                </div>
                <div className="spacer" style={{ display: "flex", justifyContent: "left", gap: "16px" }}>
                    {(context.editMode && !allowVersionEdit) &&
                        <Button variant='outlined' onClick={() => setAllowVersionEdit(true)}>
                            Edit Versions
                        </Button>}
                    {allowVersionEdit &&
                        <Button onClick={onPreActivateClicked2}>
                            Activate Versions
                        </Button>}
                    {(context.editMode && !allowVersionEdit) && <Button variant='outlined' onClick={() => setShowRetireModal(true)}>
                        Retire Guidance
                    </Button>}
                    {allowVersionEdit &&
                        <Button variant='outlined' onClick={() => setAllowVersionEdit(false)}>
                            Cancel
                        </Button>}
                    <div style={{ position: "relative", top: "10px" }}>
                        <a onClick={handleShowGuidanceHistory}>Guidance History</a>
                    </div>
                </div>
                <br /><br />
                {renderOtherDetails()}
                <br />
                <hr style={{ marginLeft: '0' }} />

                <div className='spacer-top-2' style={{ display: "flex", justifyContent: "space-between" }}>
                    <h5 style={{ width: "70%" }}>Guidance Overview</h5>
                    {(context.editMode && !allowOverviewEdit) &&
                        <Button
                            sx={{ bottom: "10px" }}
                            variant='outlined'
                            onClick={() => setAllowOverviewEdit(true)}
                        >
                            Edit
                        </Button>}
                </div>
                <Grid container>
                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Description</InputLabel>

                        {(context.editMode && allowOverviewEdit) &&
                            <TextField
                                id={"editor-desc"}
                                value={guidance.description || ""}
                                multiline={true}
                                rows={4}
                                onChange={onDescriptionChanged}
                                sx={{
                                    width: "100%",
                                    ".MuiInputBase-multiline": {
                                        padding: "0px",
                                    }
                                }}
                            />}
                        {!(context.editMode && allowOverviewEdit) &&
                            <div className='body1 spacer-top-2'>
                                {guidance?.description}
                            </div>}
                    </Grid>

                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Enter Documentation</InputLabel>
                        <div className='body3'>Documentation helps product teams to implement the changes required for the software update.</div>
                        {guidance.documentation?.map((row, index) =>
                            renderDocumentationRow(row, index)
                        )}
                    </Grid>
                    {(context.editMode && allowOverviewEdit) &&
                        <div className="spacer">
                            <Button variant="text"
                                onClick={onAddDocumentation}
                                aria-label="add documentation entry"
                                startIcon={<AddCircleOutlineIcon />}
                                style={{
                                    textTransform: "capitalize",
                                }}
                            >
                                Add Documentation
                            </Button>
                        </div>}

                    <Grid item xs={12} className="spacer detailQuestion">
                        <InputLabel className='label-2'>Enter Alternatives</InputLabel>
                        <div className='body3'>Alternative libraries could be used instead of the proposed update for this software.</div>
                        {guidance.alternatives?.map((row, index) =>
                            renderAlternativesRow(row, index)
                        )}
                    </Grid>
                    {(context.editMode && allowOverviewEdit) &&
                        <div className="spacer">
                            <Button variant="text"
                                onClick={onAddAlternatives}
                                aria-label="add alternatives entry"
                                startIcon={<AddCircleOutlineIcon />}
                                style={{
                                    textTransform: "capitalize",
                                }}
                            >
                                Add Alternative
                            </Button>
                        </div>}

                </Grid>
                {
                    (context.editMode && allowOverviewEdit) &&
                    <div className="spacer" style={{ display: "flex", gap: "16px", paddingTop: "32px" }}>
                        <Button
                            onClick={onOverviewSaved}
                        >
                            Save
                        </Button>
                        <Button
                            variant='outlined'
                            onClick={() => setAllowOverviewEdit(false)}
                        >
                            Cancel
                        </Button>

                    </div>
                }

            </div >}

            {
                guidance.state != "active" && guidance.state != "created" && <div>
                    <div className="spacer detailDiv">
                        <div style={{ alignContent: "center" }}>
                            No active guidance for <b>{documentId.basePurl}</b> at this time.
                        </div>
                    </div>
                    <div className="spacer detailDiv" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        {(context.isAdministrator || context.isEditor) &&
                            <Button onClick={onCreateGuidance} disabled={document ? false : true}>
                                Create Guidance
                            </Button>}
                        <a onClick={handleShowGuidanceHistory}>Guidance history</a>
                    </div>
                    <div className='spacer'>
                        <hr />
                    </div>
                </div>
            }

            <div style={{ paddingBottom: "80px" }}></div>
        </div >

    )

}

export default GuidanceEditor;