/**
 * Copyright (c) 2025 Capital One
*/


import React, { Fragment } from 'react'
import { User } from '../common/common';
import { Button, Divider, IconButton, ListItemText, Menu, MenuItem, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import { AppContext } from '../common/ui';

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
    const collapseMenu = useMediaQuery(theme.breakpoints.down('md'));

    const [adminMenuEl, setAdminMenuEl] = React.useState(null);
    const [allMenuEl, setAllMenuEl] = React.useState(null);
    const adminMenuOpen = Boolean(adminMenuEl);
    const allMenuOpen = Boolean(allMenuEl);

    var linkValue:number = 0;
    var rightLinkValue:number = 0;

    const _links: TopMenuLink[] = links ? links : [
        { label: "Sbom", url: "/sbom" },
    ];

    const _adminLinks: TopMenuLink[] = adminLinks ? adminLinks : [
        { label: "Sbom", url: "/sbom" },
    ];

    const _rightLinks: TopMenuLink[] = rightLinks ? rightLinks : [
    ];

    /* Open/close admin menu */
    const handleClick = (event:any) => {
        setAdminMenuEl(event.currentTarget);
      };
    const handleClose = () => {
        setAdminMenuEl(null);
    };

    /* Open/close three dots (all) menu */
    const handleClickAll = (event:any) => {
        setAllMenuEl(event.currentTarget);
      };
    const handleCloseAll = () => {
        setAllMenuEl(null);
    };

    const handleMenuClick = (event:any, link:TopMenuLink) => {
        if (link.hasOwnProperty('url') && typeof link.url == "string") {
            navigate(link.url)
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
                    className="top-menu-logo">ODS Sample App</div>
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
                        {_links?.map(link => {
                            return (
                                link.divider ? 
                                    <Divider key={"key-"+(key++)} />
                                :
                                  <MenuItem key={"key-"+(key++)} value={link.label} onClick={(event) => handleMenuClick(event, link)}>{link.label}</MenuItem>
                            );
                        })}
                        {isAdmin && <Fragment key={"key-"+(key++)}>
                            <Divider /> 
                            <MenuItem onClick={async () => { navigate("/admin") }}>Admin Settings</MenuItem>
                            </Fragment>}
                        
                        {isAdmin && _adminLinks?.map(link => {
                            return (
                                !link.divider &&
                                <MenuItem key={"key-"+(key++)} onClick={(event) => handleMenuClick(event, link)} value={link.label}>
                                    <ListItemText className="top-menu-list-item-inset" inset>{link.label}</ListItemText>
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
                        {_links?.map((link, index) => {
                            return (
                                <LinkTab key={"key-"+(key++)} className={location.pathname == link.url ? 'selected' : 'not-selected'} value={index} href={link.url} label={link.label} />                                    
                            );
                        })}
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
