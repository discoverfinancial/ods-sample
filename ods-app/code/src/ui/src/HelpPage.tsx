/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { CircularProgress, Backdrop, Tab, Tabs, Accordion, AccordionSummary} from '@mui/material'
import { AppContext } from './common';
import { useLocation } from 'react-router-dom';
import Navbar from './navbar';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TopMenu from './components/TopMenu';


interface Props {
    context: AppContext;
}

enum TabValues {
    ABOUT = "About",
    HOWTO = "How To Use",
    FAQ = "FAQ",
    ROADMAP = "Roadmap",
    RELEASES = "Releases"
}

const HelpPage: React.FC<Props> = ({ context }) => {
    const links = [{ label: "Home", url: "/" }];
    links.push({ label: "Help", url: "" })
    const location = useLocation();

    const [showSpinner, setShowSpinner] = useState<string>("");

    context.setShowSpinner = setShowSpinner;

    //  This function supports navigating to this page with location.state.loadTab
    //   set.  This property indicates that when this page loads, a specific tab
    //   should be focused.  Currently used to specify which type of user help
    //   (Contributor or Researcher) to load initially.
    const initializeCurrTab = () : string => {
        let newCurrTab:string|null = null;
        if (location && location.state && location.state.loadTab) {
            if (location.state.loadTab === TabValues.FAQ) {
                newCurrTab = TabValues.FAQ;
            } else if (location.state.loadTab === TabValues.ROADMAP) {
                newCurrTab = TabValues.ROADMAP;
            } else if (location.state.loadTab === TabValues.RELEASES) {
                newCurrTab = TabValues.RELEASES;
            }
        } else {
            newCurrTab = window.localStorage.getItem("selectedHelpTab");
        }

        return newCurrTab ? newCurrTab: TabValues.FAQ;
    }

    const [currTab, setCurrTab] = useState<string>(initializeCurrTab());

    useEffect(() => {
        if (currTab) {
            console.log("Selected tab changed =", currTab);
            window.localStorage.setItem("selectedHelpTab", currTab);
        }
    }, [currTab])

    const handleTabChange = (event: React.SyntheticEvent, newTabsValue: string) => {
        switch (newTabsValue) {
            case TabValues.ABOUT:
            case TabValues.HOWTO:
            case TabValues.FAQ:
            case TabValues.ROADMAP:
            case TabValues.RELEASES:
                setCurrTab(newTabsValue);
                break;
            default:
                break;
        }
    };

    return (
      <>
          <Navbar context={context} />
          <Backdrop
              sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
              open={(showSpinner.length > 0)}
           onClick={() => setShowSpinner("")}
          >
              <div className="spinnerDiv">
                  <p>{showSpinner}</p>
                  <CircularProgress color="info" />
              </div>
          </Backdrop>
          <div className="content1" style={{ marginTop: "0px" }}>
            <TopMenu user={context.user} isAdmin={context.isAdministrator} />
          <div className="content">
            <div className="detailDiv">
            <h1>Help and FAQ</h1>
              <div>
                <div>
                  <Tabs
                    onChange={handleTabChange}
                    value={currTab}
                    className="white"
                  >
                    <Tab value={TabValues.ABOUT} label={TabValues.ABOUT} />
                    <Tab value={TabValues.HOWTO} label={TabValues.HOWTO} />
                    <Tab value={TabValues.FAQ} label={TabValues.FAQ} />
                    <Tab value={TabValues.ROADMAP} label={TabValues.ROADMAP} />
                    <Tab
                      value={TabValues.RELEASES}
                      label={TabValues.RELEASES}
                    />
                  </Tabs>
                </div>
                {currTab === TabValues.ABOUT && (
                  <div
                    style={{ paddingTop: "var(--spacing-1)" }}
                    className="detailDiv help-tab help-tab-how fillSpace"
                  >
                    <h3>What is ODS App?</h3>
                    <div className="help-tab__detail">
                      <p>
                        ODS App is an end-to-end software development lifecycle
                        (SDLC) software asset observability solution. It allows
                        users, that do not need domain expertise or dependency
                        access, to investigate assets to identify and address
                        compliance concerns in the SDLC at scale.
                      </p>
                    </div>
                  </div>
                )}
                {currTab === TabValues.HOWTO && (
                  <div
                    style={{ paddingTop: "var(--spacing-1)" }}
                    className="detailDiv help-tab help-tab-how fillSpace"
                  >
                    <h3>How To Use ODS App</h3>
                    <div className="help-tab__detail">
                      <Accordion defaultExpanded>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography component="h4">
                            Search software
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <p>
                          A common task with ODS App is to investigate software
                          packages used within an organization. Some reasons include to
                          find which of our applications are utilizing out of
                          date software, or to see what versions of a certain
                          software package are currently being used.
                        </p>
                        <h5>Example:</h5>
                        <p>
                          The Legal department asks a team for a list of the
                          products that are dependent on versions of Spring Boot
                          that are outside our guidelines.
                        </p>
                        <div className="help-steps-list">
                          <dl>
                          <dt>Search for Spring Boot</dt>
                          <dd>
                            <div className="help-tab__media">
                              <img
                                src="/helpScreenshot1.png"
                                alt="ODS App Screenshot showing the search field"
                              />
                            </div>
                          </dd>
                          <dt>Click on 'View all software versions'</dt>
                          <dd>
                            <div className="help-tab__media">
                              <img
                                src="/helpScreenshot2.png"
                                alt="ODS App Screenshot showing the search buttons"
                              />
                            </div>
                          </dd>
                          <dt>Click on a software filter</dt>
                          <dd>
                            <p>
                              Click on{" "}
                              <b>'show software that uses all versions'</b> or{" "}
                              <b>
                                'show software that uses non-compliant versions'
                              </b>
                              , depending on the request. In this case, we are
                              looking for software packages outside our
                              guidelines, so the latter will do.
                            </p>
                            <div className="help-tab__media">
                              <img
                                src="/helpScreenshot3.png"
                                alt="ODS App Screenshot showing software filters"
                              />
                            </div>
                          </dd>
                          <dt>Export table</dt>
                          <dd>
                            <div className="help-tab__media">
                              <img
                                src="/helpScreenshot4.png"
                                alt="ODS App Screenshot showing the results table, and the export table link"
                              />
                            </div>
                          </dd>
                          <dt>Download</dt>
                          <dd>
                            The table is exported in <b>csv format</b>. In the
                            case of our example, the csv can now be sent over to
                            the legal department for review.
                          </dd>
                          </dl>
                        </div>
                      </AccordionDetails>
                      </Accordion>
                    </div>
                  </div>
                )}
                {currTab === TabValues.FAQ && (
                  <div
                    style={{ paddingTop: "var(--spacing-1)" }}
                    className="detailDiv help-tab fillSpace"
                  >
                    <h3>Frequently Asked Questions</h3>
                    <div className="help-tab__detail faq-faq__detail">
                      <dl className="faq-detail__list">
                        <dt>Where does ODS App get its data?</dt>
                        <dd>
                          <p>
                            ODS App utilizes data from a variety of sources,
                            including Cdxgen
                          </p>
                        </dd>
                        <dt>What is a guidance?</dt>
                        <dd>
                          <p>
                            A guidance is a recommendation to upgrade a software
                            package to a minimum version in order to achieve
                            compliance with our guidelines. This guidance is
                            typically founded on addressing known
                            vulnerabilities or issues.
                          </p>
                          <p>
                            <b>Note:</b> There are two tiers of guidance. Tier 1
                            are manually created by leaders. Tier 2 are{" "}
                            <b>automatically generated</b>.
                          </p>
                        </dd>
                        <dt>What is 'N-2' notation on a guidance?</dt>
                        <dd>
                          <p>
                            When viewing a guidance, you may see this N-2
                            version notation on the minimum versions:
                          </p>
                          <div className="help-tab__media">
                            <img
                              src="/faqScreenshot1.png"
                              alt="ODS App Screenshot showing a guidance with an N-2."
                            />
                          </div>
                          <p>
                            N-2 denotes two{" "}
                            <a href="https://semver.org/">major versions</a> previous to the
                            current recommended version.
                          </p>
                          <p>
                            <b>Note:</b> In cases where the current version of a
                            software package is <b>1.0.0 or less</b>, N-2
                            denotes two minor versions previous to the
                            recommended version.
                          </p>
                        </dd>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default HelpPage;