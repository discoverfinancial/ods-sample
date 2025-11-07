/**
 * Copyright (c) 2025 Capital One
*/


import React, { Fragment } from 'react'
import { User } from '../common';
import { Button, Divider, IconButton, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AppContext } from "../common";


export interface TopMenuLink {
    label?: string;
    url?: string;
    target?: string;
    divider?: boolean;
    selected?: boolean;
}

interface Props {
    user: User;
    isAdmin?: boolean;
    links?: TopMenuLink[];
    adminLinks?: TopMenuLink[];
    rightLinks?: TopMenuLink[];
    showRightSideLinks?: boolean;
    children?: React.ReactNode;
    description?: string;
    icon?: string;
    context?: AppContext;
}

let key = 0;

const TopMenu: React.FC<Props> = ({ isAdmin = false, links, adminLinks, rightLinks }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme()
    const collapseMenu = useMediaQuery(theme.breakpoints.down("xl"));

    const [adminMenuEl, setAdminMenuEl] = React.useState(null);
    const [allMenuEl, setAllMenuEl] = React.useState(null);
    const adminMenuOpen = Boolean(adminMenuEl);
    const allMenuOpen = Boolean(allMenuEl);

    const [queryMenuEl, setQueryMenuEl] = React.useState(null);
    const queryMenuOpen = Boolean(queryMenuEl);

    const [attMenuEl, setAttMenuEl] = React.useState(null);
    const attMenuOpen = Boolean(attMenuEl);

    const [dataMenuEl, setDataMenuEl] = React.useState(null);
    const dataMenuOpen = Boolean(dataMenuEl);

    var linkValue:number = 99;
    var rightLinkValue:number = 0;

    const _dataLinks: TopMenuLink[] = [
        { label: "Software", url: "/list" },
        { label: "Most Used Software", url: "/mostused" },
        { label: "Top-Level Dependencies", url: "/toplevel" },
        { label: "Libraries", url: "/libraries" },
        { divider: true },
        { label: "EndofLife", url: "/endoflife" },
    ];

    const _queryLinks: TopMenuLink[] = [
        //{ label: "Queries", url: "/query", target: "_query" },
        { label: "Server Scripts", url: "/serverscript", target: "_serverscript" },
        ...isAdmin ? [{ label: "Admin Scripts", url: "/adminscript", target: "_adminscript" }] : [],
        { label: "Notebooks", url: "/notebook", target: "_notebook" },
        { label: "Pages", url: "/page", target: "_page" },
    ];

    const _adminLinks: TopMenuLink[] = [
        { label: "Admin Settings", url: "/admin" },
        { divider: true },
        { label: "ODS Logs", url: "/logs" },
        { divider: true },
        { label: "ETL Manager", url: "/etl" },
        { label: "ETL Logs", url: "/etllogs" },
    ];

    const _rightLinks: TopMenuLink[] = rightLinks ? rightLinks : [
        { label: "Help", url: "/help" },
    ];

    /* Open/close admin menu */
    const handleAdminClick = (event:any) => {
        setAdminMenuEl(event.currentTarget);
      };
    const handleAdminClose = () => {
        setAdminMenuEl(null);
    };

    /* Open/close query menu */
    const handleQueryClick = (event:any) => {
        setQueryMenuEl(event.currentTarget);
      };
    const handleQueryClose = () => {
        setQueryMenuEl(null);
    };

    /* Open/close attestation menu */
    const handleAttClick = (event:any) => {
        setAttMenuEl(event.currentTarget);
      };
    const handleAttClose = () => {
        setAttMenuEl(null);
    };

    /* Open/close data menu */
    const handleDataClick = (event:any) => {
        setDataMenuEl(event.currentTarget);
      };
    const handleDataClose = () => {
        setDataMenuEl(null);
    };
    
    /* Open/close three dots (all) menu */
    const handleClickAll = (event:any) => {
        setAllMenuEl(event.currentTarget);
      };
    const handleCloseAll = () => {
        setAllMenuEl(null);
    };

    const handleMenuClick = (event:any, link:TopMenuLink, open=false) => {
        if (link.hasOwnProperty('url') && typeof link.url == "string") {
            handleAdminClose();
            handleQueryClose();
            handleAttClose();
            if (open) {
                window.open(link.url, "_blank")
            }
            else {
                navigate(link.url)
            }
        }
    }

    interface LinkTabProps {
        label?: string;
        href?: string;
        selected?: boolean;
        className: string;
        value: number;
    }

    function LinkTab(props: LinkTabProps) {
        return (
            <Tab
            component="a"
            aria-current={props.selected && 'page'}
            {...props}
            />
        );
    }

    return (
        <div className="top-menu-container">
            <div className="top-menu">
                <div style={{ backgroundImage: "url(/surveyorEye.svg)"}}
                    className="top-menu-logo">Surveyor</div>
                    {collapseMenu && <div className="top-menu-links top-menu-links--right">
                        <IconButton
                            className={allMenuOpen ? 'top-menu-menu-btn top-menu-menu-btn--expanded' : 'top-menu-menu-btn'}
                            aria-label="more"
                            aria-controls={allMenuOpen ? 'long-menu' : undefined}
                            aria-expanded={allMenuOpen ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleClickAll}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="top-menu-drop-menu-full"
                            className="top-menu-menu-pop"
                            MenuListProps={{
                            'aria-labelledby': 'long-button',
                            }}
                            anchorEl={allMenuEl}
                            open={allMenuOpen}
                            onClose={handleCloseAll}
                        >

                        <Fragment key={"key-"+(key++)}>
                            <MenuItem>Data Inspector</MenuItem>
                        </Fragment>

                        {_dataLinks?.map(link => {
                            return (
                                !link.divider &&
                                <MenuItem key={"key-"+(key++)} onClick={(event) => handleMenuClick(event, link)} value={link.label}>
                                    <ListItemText className="top-menu-list-item-inset" inset>{link.label}</ListItemText>
                                </MenuItem>
                            );
                        })}

                        <Fragment key={"key-"+(key++)}>
                            <Divider/>
                            <MenuItem>Queries</MenuItem>
                        </Fragment>

                        {_queryLinks?.map(link => {
                            return (
                                !link.divider &&
                                <MenuItem key={"key-"+(key++)} onClick={(event) => handleMenuClick(event, link)} value={link.label}>
                                    <ListItemText className="top-menu-list-item-inset" inset>{link.label}</ListItemText>
                                </MenuItem>
                            );
                        })}

                        {isAdmin && <Fragment key={"key-"+(key++)}>
                            <Divider /> 
                            <MenuItem onClick={async () => { navigate("/admin") }}>Administrator</MenuItem>
                            </Fragment>}

                        {isAdmin && _adminLinks?.map(link => {
                            return (
                                !link.divider &&
                                <MenuItem key={"key-"+(key++)} onClick={(event) => handleMenuClick(event, link)} value={link.label}>
                                    <ListItemText className="top-menu-list-item-inset" inset primary={link.label} />
                                </MenuItem>
                            );
                        })}
                        <Divider />
                        {_rightLinks.length > 0 && _rightLinks?.map(link => {
                            return (
                                link.divider ? 
                                    <Divider key={"key-"+(key++)}/>
                                    :
                                    <MenuItem key={"key-"+(key++)} value={link.label} onClick={(event) => handleMenuClick(event, link)}>{link.label}</MenuItem>
                            );
                        })}
                        </Menu>
                    </div>}
                    {!collapseMenu && <>
                        <Tabs
                            className="top-menu-links"
                            value={linkValue}
                            aria-label="top menu tabs"
                            role="navigation"
                        >

                        <Tab
                            id="top-menu-query-btn"
                            className={dataMenuOpen ? 'top-menu-menu-btn top-menu-menu-btn--expanded' : 'top-menu-menu-btn'}
                            aria-controls={dataMenuOpen ? 'top-menu-drop-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={dataMenuOpen ? 'true' : undefined}
                            onClick={handleDataClick}
                            icon={<KeyboardArrowDownIcon />}
                            label={"Data Inspector"}
                            value={99}
                        />
                        <Menu
                            id="top-menu-drop-menu"
                            anchorEl={dataMenuEl}
                            open={dataMenuOpen}
                            onClose={handleDataClose}
                            className="top-menu-menu-pop"
                            MenuListProps={{
                            'aria-labelledby': 'top-menu-query-btn',
                            }}
                        >
                            {_dataLinks?.map(link => {
                                return (
                                    link.divider ? 
                                        <Divider key={"key-"+(key++)}/>
                                        :
                                        <ListItemButton key={"key-"+(key++)} className="top-menu-list-item-inset" style={{width:"100%"}}>
                                            <ListItemText inset primary={link.label} onClick={(event) => handleMenuClick(event, link)}/>
                                            <Tooltip title="Open in new window" placement="right" enterDelay={500}>
                                                <ListItemIcon onClick={(event) => handleMenuClick(event, link, true)}><OpenInNewIcon/></ListItemIcon>
                                            </Tooltip>
                                        </ListItemButton>
                                );
                            })}
                        </Menu>

                        <Tab
                            id="top-menu-query-btn"
                            className={queryMenuOpen ? 'top-menu-menu-btn top-menu-menu-btn--expanded' : 'top-menu-menu-btn'}
                            aria-controls={queryMenuOpen ? 'top-menu-drop-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={queryMenuOpen ? 'true' : undefined}
                            onClick={handleQueryClick}
                            icon={<KeyboardArrowDownIcon />}
                            label={"Queries"}
                            value={98}
                        />
                        <Menu
                            id="top-menu-drop-menu"
                            anchorEl={queryMenuEl}
                            open={queryMenuOpen}
                            onClose={handleQueryClose}
                            className="top-menu-menu-pop"
                            MenuListProps={{
                            'aria-labelledby': 'top-menu-query-btn',
                            }}
                        >
                            {_queryLinks?.map(link => {
                                return (
                                    link.divider ? 
                                        <Divider key={"key-"+(key++)}/>
                                        :
                                        <ListItemButton key={"key-"+(key++)} className="top-menu-list-item-inset" style={{width:"100%"}}>
                                            <ListItemText inset primary={link.label} onClick={(event) => handleMenuClick(event, link)}/>
                                            <Tooltip title="Open in new window" placement="right" enterDelay={500}>
                                                <ListItemIcon onClick={(event) => handleMenuClick(event, link, true)}><OpenInNewIcon/></ListItemIcon>
                                            </Tooltip>
                                        </ListItemButton>
                                );
                            })}
                        </Menu>

                        {isAdmin && <>
                            <Tab
                                id="top-menu-admin-btn"
                                className={adminMenuOpen ? 'top-menu-menu-btn top-menu-menu-btn--expanded' : 'top-menu-menu-btn'}
                                aria-controls={adminMenuOpen ? 'top-menu-drop-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={adminMenuOpen ? 'true' : undefined}
                                onClick={handleAdminClick}
                                icon={<KeyboardArrowDownIcon />}
                                label={"Administrator"}
                                value={97}
                            />
                            <Menu
                                id="top-menu-drop-menu"
                                anchorEl={adminMenuEl}
                                open={adminMenuOpen}
                                onClose={handleAdminClose}
                                className="top-menu-menu-pop"
                                MenuListProps={{
                                'aria-labelledby': 'top-menu-admin-btn',
                                }}
                            >
                                {_adminLinks?.map(link => {
                                    return (
                                        link.divider ? 
                                            <Divider key={"key-"+(key++)}/>
                                            :
                                            <ListItemButton key={"key-"+(key++)} className="top-menu-list-item-inset" style={{width:"100%"}}>
                                                <ListItemText inset primary={link.label} onClick={(event) => handleMenuClick(event, link)}/>
                                                <Tooltip title="Open in new window" placement="right" enterDelay={500}>
                                                    <ListItemIcon onClick={(event) => handleMenuClick(event, link, true)}><OpenInNewIcon/></ListItemIcon>
                                                </Tooltip>
                                            </ListItemButton>
                                    );
                                })}
                            </Menu>
                        </>}
                    </Tabs>
                    <Tabs
                        className="top-menu-links top-menu-links--right"
                        value={rightLinkValue}
                        aria-label="top menu tabs on the right side"
                        role="navigation"
                        >
                        {_rightLinks?.map((link, index) => {
                                return (
                                    <LinkTab key={"key-"+(key++)} className={location.pathname == link.url ? 'selected' : 'not-selected'} value={index} href={link.url} label={link.label} />                                    
                                );
                            })}
                    </Tabs>
                    </>}
            </div>
        </div>
    )
}

export default TopMenu;
