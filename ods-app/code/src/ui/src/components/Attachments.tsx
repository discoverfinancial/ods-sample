/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useRef, useEffect } from 'react';
import {SbomDocumentInfo, AttachmentInfo} from '../common';
import { DocMgr } from '../managers/DocMgr';
import { AppContext } from "../common";
import { Backdrop, Snackbar, Button } from '@mui/material'
import { CircularProgress } from '@mui/material'
import FileUpload from "./upload/FileUpload"
import StyledDialog from './StyledDialog';
import AttachmentsTable from "./AttachmentsTable";

interface Props {
    document: any;
    setDocument: React.Dispatch<React.SetStateAction<any | undefined>>;
    context: AppContext;
    docMgr?: any
}

const Attachments: React.FC<Props> = ({document, setDocument, context, docMgr}) => {
    if (!docMgr) {
        docMgr = DocMgr.getInstance();
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showSpinner, setShowSpinner] = useState<string>("");
    const [fileUploadKey, setFileUploadKey] = useState<number>(0);
    const [showAlert, setShowAlert] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<boolean>(false);

    const [filesToUpload, setFilesToUpload] = useState<any>([])

    const handleFilesChange = (files:any) => {
      // Update chosen files
      setFilesToUpload([ ...files ])
    };

    async function attachmentView(file: AttachmentInfo): Promise<void> {
        console.log("attachmentView()")
        console.log(file);
        window.open(file.url); // open in new tab
    }

    async function attachmentDelete(file: AttachmentInfo): Promise<void> {
        console.log("attachmentDelete()")
        console.log(file);
        setShowAlert(file)
    }
    async function doAttachmentDelete(file: AttachmentInfo) : Promise<void> {
        console.log("Delete attachment ", file);
        const r = await docMgr.deleteAttachment(document.id, file.id);
        if (r !== null) {
            setDocument({...document, attachments: r});
        }
    }

    async function attachmentCopy(file: AttachmentInfo): Promise<void> {
        console.log("attachmentCopy()")
        console.log(file);
        navigator.clipboard.writeText(file.url);
        setSnackbar(true);
    }

    async function onUploadChangeOld(event: any, files:any, diffedFiles:any): Promise<void> {
        console.log("onUploadChange()");
        console.log("event=", event, " files=", files, " diffedFiled=", diffedFiles);
        setShowSpinner("Uploading file...");
        await uploadFiles();
        setFileUploadKey((fileUploadKey+1) % 4); // change key to cause reset of FileUpload component
        setTimeout(function() {
            setShowSpinner("");
        }, 10)
    }

    async function onUploadChange(files:any): Promise<void> {
        console.log("onUploadChange()");
        console.log("files=", files);
        setShowSpinner("Uploading file...");
        await uploadFiles();
        setFileUploadKey((fileUploadKey+1) % 4); // change key to cause reset of FileUpload component
        setTimeout(function() {
            setShowSpinner("");
        }, 10)
    }

    async function uploadFiles(): Promise<void> {
        console.log("uploadFiles()");
        let files = filesToUpload; //fileInputRef.current?.files;
        console.log(files);
        if (files) {
            for (var i=0; i<files.length; i++) {
                let file = files[i];
                console.log("Upload file",file);
                if (file) {
                    const r = await docMgr.uploadAttachment(document.id, file);
                    if (r) {
                        setDocument({...document, attachments: r});
                    }
                }
            }
        }
        setFilesToUpload([])
    }

    useEffect(() => {
        if (filesToUpload.length > 0) {
            console.log("filesToUpload changed=", filesToUpload)
            uploadFiles();
        }
    }, [filesToUpload])

    return (
        <div id="attachmentsTable">
            <AttachmentsTable
                attachments={document.attachments || []}
                handleViewRow={attachmentView}
                handleDeleteRow={attachmentDelete}
                handleCopyRow={attachmentCopy}
                disabled={!context.editMode}
            />
            {context.editMode && <div>
                <div className="attachmentsUpload" style={{ width: "350px", paddingTop: "10px" }}>
                    <FileUpload
                        key={"fileuploadKey_" + fileUploadKey}
                        id="fileuploadId"
                        onFilesChange={handleFilesChange}
                        ref={fileInputRef}
                        disabled={!context.editMode}
                        className="fileupload"
                        title=""
                        header="Drop file(s) to upload"
                        leftLabel="or"
                        rightLabel="files"
                        buttonLabel="Select"
                        buttonRemoveLabel=""
                        imageSrc="/upload.png"
                        PlaceholderImageDimension={{
                            xs: { width: 80, height: 80 },
                            sm: { width: 80, height: 80 },
                            md: { width: 80, height: 80 },
                            lg: { width: 80, height: 80 }
                          }}
                        sx={{
                            ".MuiTypography-root-h5": {
                                fontSize: "10px",
                            }
                        }}
                    />
                </div>
                <div className="spacer"/>
            </div>}

            <Snackbar 
                open={snackbar}
                onClose={(event, reason) => {setSnackbar(false)}}
                message="Attachment URL copied to clipboard"
                autoHideDuration={3000}
                transitionDuration={1000}
            />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                open={(showSpinner.length > 0)}
                onClick={() => setShowSpinner("")}>
                <div className="spinnerDiv">
                    <p>{showSpinner}</p>
                    <CircularProgress color="inherit" />
                </div>
            </Backdrop>

            {(showAlert != null) && <StyledDialog
                open={true}
                actions={[
                    {
                        label: "Yes",
                        onClick: async function onClick() {
                            let file = {...showAlert}
                            setShowAlert(null);
                            await doAttachmentDelete(file);
                            return;
                        },
                    },
                    {
                        label: "No",
                        onClick: function onClick() {
                            return setShowAlert(null);
                        },
                    },
                ]}
                onClose={function onClose() {
                    return setShowAlert(null);
                }}
                title="Delete Attachment?"
            >
                Do you want to delete "{showAlert.name}"?
            </StyledDialog>
            }
        </div>
    )
}

export default Attachments;
