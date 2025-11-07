/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState, useEffect, useRef } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import parse from 'html-react-parser';
import draftToHtml from 'draftjs-to-html';
import EditorContainer from '../components/EditorContainer';
import { getDocField, setDocField } from '../managers';
import { AppContext } from "../common";
import { IDocMgr, IAttachmentMgr } from '../managers/Managers';

let timeOutId:any;

interface Props {
    fieldName: string;
    document: any;
    setDocument: React.Dispatch<React.SetStateAction<any>>;
    context: AppContext
    children?: React.ReactNode;
    onChange?: (document: any, fieldName: string) => Promise<void>;
    required?: boolean;
    docMgr: IDocMgr<any> & IAttachmentMgr;
}

const WysiwygEditor: React.FC<Props> = ({ fieldName, document, setDocument, context, children, onChange, required=false , docMgr}) => {
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const iData = getDocField(document, fieldName);
    const [data, setData] = useState<EditorState>((
        iData ? EditorState.createWithContent(convertFromRaw(JSON.parse(iData))) : EditorState.createEmpty()))
    
    async function saveData() {
        let value = "";
        if (data.getCurrentContent().getPlainText()) {
            value = JSON.stringify(convertToRaw(data.getCurrentContent()));
        }
        if ( getDocField(document, fieldName) != value) {
            console.log("Editor state data changed=", value);
            setDocField(document, fieldName, value);
            const r = await docMgr.saveDocument(document, fieldName);
            if (r) {
                setDocument(r);
                if (onChange) {
                    onChange(r, fieldName);
                }
            }
        }
    }

    function uploadImageCallback(file: File): Promise<any> {
        console.log("uploadImageCallback()");
        return new Promise(async(resolve, reject): Promise<any> => {
            const r = await docMgr.uploadAttachment(document.id, file);
            const _doc = {...document, attachments: r};
            setDocument(_doc)
            if (onChange) {
                onChange(_doc, fieldName);
            }
            for (var i=0; i<r.length; i++) {
                if (r[i].name === file.name) {
                    return resolve({data: {link: r[i].url}});
                }
            }
            return resolve({data: {link: "Error uploading"}});
        })
    }

    async function onEditorBlur() {
        saveData();
    }

    useEffect(() => {
        console.log("Init page load")
        setInitComplete(true);
    }, []);

    useEffect(() => {
        if (initComplete) {
            if (timeOutId) clearTimeout(timeOutId);
            timeOutId = setTimeout(async () => {
                timeOutId = null;
                saveData();
            }, 3000);
        }
    }, [data]);

    return (
        <div>
            {children && 
                <div className="editorDescription">{children}</div>
            }
            <div className="editorDiv">
                {context.editMode && <EditorContainer 
                    id={"editor-"+fieldName} 
                    data={data} 
                    setData={setData} 
                    label={fieldName}
                    editMode={context.editMode} 
                    onBlur={onEditorBlur} 
                    uploadImageCallback={uploadImageCallback}
                    required={required}
                    setError={context.setError}
                />}
                {!context.editMode && 
                    <div>{parse(draftToHtml(convertToRaw(data.getCurrentContent())))}</div>
                }
            </div>
        </div>
    )
}

export default WysiwygEditor;
