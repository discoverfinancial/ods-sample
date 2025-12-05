/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState, useEffect } from 'react';
import { AppContext } from './common';
import TopMenu from './components/TopMenu';
import Navbar from './navbar';

interface Props {
    context: AppContext;
}

const TestPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Test";
    const [initComplete, setInitComplete] = useState<boolean>(false);

    useEffect(() => {
        console.log("Init page load")

        function clear() {
            setInitComplete(false);
        }
        return () => {
            clear();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
    }, [initComplete])

    function getNumbers(len: number) {
        const r = [];
        for (var i=0; i<len; i++) {
            r.push(""+i);
        }
        return r;
    }

    console.log("context=", context);

    return (
        <>
            <Navbar context={context} />
            <div className="content1" style={{ marginTop: "0px" }}>
            <TopMenu user={context.user} isAdmin={context.isAdministrator} />

            <div className="content">
            <div className="detailDiv">
                <h1>Problem - SOLVED</h1>

                <div style={{display:"flex", justifyContent:"space-between", padding:"20px", border:"1px solid blue", gap:"10px"}}>
                    <div style={{border:"1px solid gray", flex:"1"}}>
                        <div>Left div</div>
                        <div>This is some short content</div>
                        {getNumbers(10).map((i:string) => {
                            return <div>This is number {i}</div>
                        }
                        )}
                    </div>
                    <div style={{border:"1px solid gray", width:"400px", position:"relative"}}>
                            <div style={{position:"absolute", top:0, right:0, left:0, bottom:0, overflowY:"scroll"}}>
                                <div>Left div</div>
                                <div>This is some long content that should have scroll bars for any content that is longer than the left div (it should only show up to number 9 on left div)</div>
                                {getNumbers(20).map((i:string) => {
                                    return <div>This is number {i}</div>
                                }
                                )}
                            </div>
                    </div>
                </div>

                <div style={{border:"1px solid green", padding:"20px"}}>
                More stuff here
                </div>

                <h1>It should look something like this</h1>
                But without the hardcoded height on right div
                <div style={{display:"flex", justifyContent:"space-between", padding:"20px", border:"1px solid blue", gap:"10px"}}>
                    <div style={{border:"1px solid gray", flex:"1"}}>
                        <div>Left div</div>
                        <div>This is some short content</div>
                        {getNumbers(10).map((i:string) => {
                            return <div>This is number {i}</div>
                        }
                        )}
                    </div>
                    <div style={{border:"1px solid gray", width:"400px", height:"220px", overflow:"auto"}}>
                        <div>Left div</div>
                        <div>This is some long content that should have scroll bars for any content that is longer than the left div (it should only show up to number 9 on left div)</div>
                        {getNumbers(20).map((i:string) => {
                            return <div>This is number {i}</div>
                        }
                        )}
                    </div>
                </div>

                <div style={{border:"1px solid green", padding:"20px"}}>
                More stuff here
                </div>
            </div></div>
            </div>
        </>
    )
}

export default TestPage;

