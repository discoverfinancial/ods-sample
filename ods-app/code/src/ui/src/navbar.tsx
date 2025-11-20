/**
 * Copyright (c) 2025 Capital One
*/

import React, { useEffect, useState } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  styled,
  Button,
  Drawer,
  Tooltip,
  TextField,
} from '@mui/material';
import { AppContext, formatDate } from './common';
import { Alert } from '@mui/material'
import UserAvatar from './components/UserAvatar';
import { ApiTokenMgr } from './managers/ApiTokenMgr';
import { ApiTokenCreate, ApiTokenSummary, ApiKeyCreate, ApiKeySummary } from './common';
import { ApiKeyMgr } from './managers/ApiKeyMgr';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import SecretField from './components/SecretField';
import { v4 as uuidv4 } from 'uuid';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1),
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  textAlign: 'left',
  color: '#fff',
  backgroundColor: 'transparent',
  boxShadow: '0px 0px 0px 0px transparent'
}));

type navItemType = {
    navItemName: string;
    navLink: string;
}

type Props = {
    context: AppContext;
    errors?: any;
};

const Navbar: React.FC<Props> = React.memo(({context, errors}) => {
    const user = context.user;
    const apiTokenMgr = ApiTokenMgr.getInstance();
    const apiKeyMgr = ApiKeyMgr.getInstance();

    const links: navItemType[] = [];
    
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [apiToken, setApiToken] = useState<ApiTokenSummary>();
    const [apiKeys, setApiKeys] = useState<any>();

    useEffect(() => {
        const doWork = async () => {
            // retrieve apitoken information if there is one
            try {
                const result = await apiTokenMgr.getDocuments({params: {match: { "owner.email": context.user.email}}})
                if (result && result.length) {
                    setApiToken(result[0]);
                }
            } catch (e) {
                console.log("Error getting api token: ", e);
            }
            // retrieve apikeys information
            try {
                const result = await apiKeyMgr.getDocuments({})
                if (result && result.length) {
                    setApiKeys(result);
                }
            } catch (e) {
                console.log("Error getting api keys: ", e);
            }
        }

        doWork();
    }, []);

    const createApiToken = async () => {
        const tokenData: ApiTokenCreate = {
            name: "User Api Token"
        }
        const result = await apiTokenMgr.createDocument(tokenData);
        if (result) {
            setApiToken(result);
        }
    }

    const deleteApiToken = async (id: string) => {
        const result = await apiTokenMgr.deleteDocument(id);
        if (result) {
            setApiToken(undefined);
        }
    }

    const createApiKey = async (key: string, role: string, app: string) => {
        const keyData: ApiKeyCreate = {
            key: key,
            role: role,
            app: app,
        }
        const result = await apiKeyMgr.createDocument(keyData);
        if (result) {
            const updatedKeys = await apiKeyMgr.getDocuments({});
            setApiKeys(updatedKeys);
        }
    }    

    const updateApiKey = async (id: string, key: string, role: string, app: string) => {
        const keyData: ApiKeyCreate = {
            id: id,
            key: key,
            role: role,
            app: app,
        }
        const result = await apiKeyMgr.saveDocument(keyData);
        if (result) {
            const updatedKeys = await apiKeyMgr.getDocuments({});
            setApiKeys(updatedKeys);
        }
    }    

    const deleteApiKey = async (id: string) => {
        const result = await apiKeyMgr.deleteDocument(id);
        if (result) {
            const updatedKeys = await apiKeyMgr.getDocuments({});
            setApiKeys(updatedKeys);
        }
    }

    const renderError = () => {

        if (errors !== undefined) {
            let errArray = [];
            for (var i in errors) {
                errArray.push(errors[i].label)
            }
            let errorText = errArray.join(", ")
            if (errorText.length > 0) {
                return (
                    <div style={{ backgroundColor: "white", paddingTop: "14px", paddingLeft: "10px", paddingRight: "10px", paddingBottom: "6px" }}>
                        <div style={{ margin: "20px" }}>
                            <Alert severity='error' title="The following information needs to be entered:"><div>{errorText}</div></Alert>
                        </div>
                    </div>
                )
            }
            else {
                return (
                    <div style={{ backgroundColor: "white", paddingTop: "0px", paddingLeft: "10px", paddingRight: "10px" }}>
                        &nbsp;</div>
                );
            }
        }
    }

    const renderApiToken = () => {

        if (apiToken) {
            return (
                <table className="detailTable"><tbody>
                <tr>
                    <td>Token</td>
                    <td>
                        <SecretField value={apiToken.value} readonly={true} />
                        <Tooltip title="Copy token to clipboard">
                            <Button variant="text"  className="tablebutton" onClick={() => { navigator.clipboard.writeText(apiToken.value) }}>
                                <ContentCopyOutlinedIcon/>
                            </Button>
                        </Tooltip>
                    </td>
                    <td>
                        <Tooltip title="Delete token">
                            <Button variant="text" className="tablebutton" aria-label="delete api token" onClick={(event:any) => {
                                (event.target as any).blur();
                                deleteApiToken(apiToken.id);
                            }}>
                                <DeleteOutlinedIcon/>
                            </Button>
                        </Tooltip>
                    </td>
                </tr>
                <tr>
                    <td>Expires</td>
                    <td className="textEmphasize">{apiToken.expirationDate ? new Date(apiToken.expirationDate).toLocaleString() : ""}</td>
                </tr>
                </tbody></table>
            )
        }
        if (!apiToken) {
            return (
                <table className="detailTable"><tbody>
                <tr>
                    <td>Token</td>
                    <td><Button className="buttonLink" onClick={()=>{ createApiToken() }}>Create Token</Button></td>
                </tr></tbody></table>
            )
        }
    }

    const renderApiKeys = () => {

        return (
            <table className="roundedTable" style={{}}>
                <thead>
                    <tr><td style={{textAlign:"center"}}>Api Key</td>
                        <td style={{textAlign:"center"}}>Role</td>
                        <td style={{textAlign:"center"}}>App Name</td>
                        <td style={{textAlign:"center"}}>Date</td>
                        <td style={{textAlign:"center"}}>Expires</td>
                        <td style={{textAlign:"center"}}>Action</td>
                    </tr>
                </thead><tbody>
                {apiKeys && apiKeys.map((key: any, index: number) => {
                    return (
                        <tr>
                            <td style={{paddingTop:"16px"}}>
                                <SecretField value={key.key} readonly={true} />
                                <Tooltip title="Copy token to clipboard">
                                    <Button variant="text"  className="tablebutton" style={{paddingLeft:"0px"}} onClick={() => { navigator.clipboard.writeText(key.key) }}>
                                        <ContentCopyOutlinedIcon/>
                                    </Button>
                                </Tooltip>
                            </td>
                            <td style={{paddingTop:"16px"}}>
                                <TextField id={key.id+"_role"} label="Role" variant="outlined" size="small" defaultValue={key.role} />
                            </td>
                            <td style={{paddingTop:"16px"}}>
                                <TextField id={key.id+"_app"} label="App Name" variant="outlined" size="small" defaultValue={key.app} />
                            </td>
                            <td style={{paddingTop:"16px"}}>{formatDate(key.dateUpdated)}</td>
                            <td style={{paddingTop:"16px"}}>{formatDate(key.expirationDate)}</td>

                            <td style={{paddingTop:"16px"}}>
                                <Button className="buttonLink" onClick={()=>{ 
                                    updateApiKey(key.id, 
                                        key.key, 
                                        (document.getElementById(`${key.id}_role`) as HTMLInputElement).value, 
                                        (document.getElementById(`${key.id}_app`) as HTMLInputElement).value);
                                }}>Update</Button><br/>
                                <Button className="buttonLink" onClick={()=>{ deleteApiKey(key.id) }}>Delete</Button>
                            </td>
                        </tr>
                    )
                })}
                <tr>
                    <td style={{paddingTop:"16px"}}>
                        <TextField id="newKey" label="Api Key" variant="outlined" size="small" />
                        <Tooltip title="Generate key">
                            <Button variant="text"  className="tablebutton" style={{paddingLeft:"16px"}} onClick={() => { 
                                const newKey = uuidv4();
                                (document.getElementById("newKey") as HTMLInputElement).value = newKey;
                                }}>
                                <LockResetRoundedIcon/>
                            </Button>
                        </Tooltip>
                        <Tooltip title="Copy key to clipboard">
                            <Button variant="text"  className="tablebutton" style={{paddingLeft:"22px"}} 
                                onClick={() => { 
                                    const key = (document.getElementById("newKey") as HTMLInputElement).value;
                                    navigator.clipboard.writeText(key) 
                                }}>
                                <ContentCopyOutlinedIcon/>
                            </Button>
                        </Tooltip>

                    </td>
                    <td style={{paddingTop:"16px"}}>
                        <TextField id="newRole" label="Role" variant="outlined" size="small" />
                    </td>
                    <td style={{paddingTop:"16px"}}>
                        <TextField id="newApp" label="App Name" variant="outlined" size="small" />
                    </td>
                    <td>
                    </td>
                    <td>
                    </td>
                    <td style={{paddingTop:"16px"}}>
                        <Button className="buttonLink" onClick={async ()=>{ 
                            const key = (document.getElementById("newKey") as HTMLInputElement).value;
                            const role = (document.getElementById("newRole") as HTMLInputElement).value;
                            const app = (document.getElementById("newApp") as HTMLInputElement).value;
                            await createApiKey(key, role, app); 
                            (document.getElementById("newKey") as HTMLInputElement).value = "";
                            (document.getElementById("newRole") as HTMLInputElement).value = "";
                            (document.getElementById("newApp") as HTMLInputElement).value = "";
                        }}>Create</Button>
                    </td>
                </tr>
            </tbody></table>
        )
    }

    const url = "https://dta-images.discoverfinancial.com/profile/" + encodeURI(user.email);
    //'/defaultuser.svg'

    return (
        <>
            <div id='navbar' style={{ position: 'sticky', top: 0, zIndex: 120 }} className='bg-navbar-dark'>
                <Container fixed sx={{ paddingRight: '0px' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1} sx={{ marginTop: '0px' }}>
                            <Grid item lg={10} md={10} sm={12} xs={12} id='navstuff'>
                                <Item className='link-items' id={'parent-links'}>
                                    {links.length > 0 &&
                                        links.map((navItem, index) => {
                                            return (
                                                <React.Fragment key={`nav-item-${navItem.navItemName}-${index}`}>
                                                    <Button
                                                        className='nav-item'
                                                        id={`nav-item-${navItem.navItemName}-${index}`}
                                                        onClick={() => {
                                                            window.location.href = navItem.navLink;
                                                        }}
                                                    >
                                                        {navItem.navItemName}
                                                    </Button>
                                                </React.Fragment>
                                            );
                                        })}
                                </Item>
                                <Item className='icon-nav'>
                                    <Link
                                        aria-label='Personal Profile'
                                        style={{
                                            marginLeft: '1rem',
                                            height: '44px',
                                            width: '44px',
                                            padding: 0,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                        to={``}
                                        onClick={() => setShowProfile(true)}
                                    >
                                        <UserAvatar user={user} />
                                    </Link>
                                    <Drawer anchor='right' open={showProfile} onClose={() => setShowProfile(false)}>
                                        <div style={{marginLeft: "10px"}}>
                                            <div className="loggedinuserHeader">Logged in User</div>
                                            <div className="detailDiv">
                                                <table className="detailTable"><tbody>
                                                    <tr><td>Name</td><td>{user.name}</td></tr>
                                                    <tr><td>Email</td><td>{user.email}</td></tr>
                                                    <tr><td>Title</td><td>{user.title}</td></tr>
                                                    <tr><td>Department</td><td>{user.department}</td></tr>
                                                    <tr><td>Roles</td><td>{user.roles.map((role: string, i: number) => {
                                                        return (<span key={"role_" + i}>{role}<br /></span>)
                                                    })}</td></tr>
                                                </tbody></table>
                                            </div>
                                            <div className="loggedinuserHeader loggedinuserSubheader">Api Token</div>
                                            <div className="detailDiv">
                                                { renderApiToken() }
                                            </div>
                                            {context?.isAdministrator && <div style={{marginTop: "10px", marginBottom: "20px"}}>
                                                <div className="loggedinuserHeader loggedinuserSubheader spacer">Api Keys</div>
                                                <div className="detailDiv">
                                                    {/* {JSON.stringify(apiKeys)} */}
                                                    { renderApiKeys() }
                                                </div>
                                            </div>}
                                            {context?.info?.basicAuthEnabled=="true" && <div className="detailDiv">
                                                <Button onClick={() => {
                                                    window.location.href = '/logout'
                                                }}>Logout</Button>
                                            </div>}
                                            {context?.info?.oauthEnabled=="true" && <div className="detailDiv">
                                                <Button onClick={() => {
                                                    window.location.href = '/logout'
                                                }}>Logout</Button>
                                            </div>}
                                        </div>
                                    </Drawer>
                                </Item>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
                {/* {renderError()} */}
            </div>
        </>
    );
});
Navbar.displayName = 'Navbar';
export default Navbar;
