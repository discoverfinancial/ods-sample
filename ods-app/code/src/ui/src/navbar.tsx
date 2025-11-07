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
} from '@mui/material';
import { AppContext } from './common';
import { Alert } from '@mui/material'
import UserAvatar from './components/UserAvatar';
import { ApiTokenMgr } from './managers/ApiTokenMgr';
import { ApiTokenCreate, ApiTokenSummary } from './common';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SecretField from './components/SecretField';

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
    const mgr = ApiTokenMgr.getInstance();

    const links: navItemType[] = [];
    
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [apiToken, setApiToken] = useState<ApiTokenSummary>();

    useEffect(() => {
        const doWork = async () => {
            // retrieve apitoken information if there is one
            try {
            const result = await mgr.getDocuments({params: {match: { "owner.email": context.user.email}}})
            if (result && result.length) {
                setApiToken(result[0]);
            }
            } catch (e) {
                console.log("Error getting api token: ", e);
            }
        }

        doWork();
    }, []);

    const createApiToken = async () => {
        const tokenData: ApiTokenCreate = {
            name: "User Api Token"
        }
        const result = await mgr.createDocument(tokenData);
        if (result) {
            setApiToken(result);
        }
    }

    const deleteApiToken = async (id: string) => {
        const result = await mgr.deleteDocument(id);
        if (result) {
            setApiToken(undefined);
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
