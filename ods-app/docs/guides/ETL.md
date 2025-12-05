# ETL

## ETL Mgr

The ETL Mgr allows you to view the current ETL status or manually start ETL processes.

The ETL UI can accessed in the Administrator section of the top menu. `EtlMgr` contains the methods that can be used to call the ETL API endpoints. The actual commands that can be run can be found in `ETLController`. These map to the buttons seen in the UI.

## ETL Logs

ODS has its own set of documents for log entries, The collection is called "logs" and the interface is called "Store". `LogMgr` contains the relevant functions. A table of log entries by time can be seen on the `ETL Logs` page. Entries can be cleared in the action menu.

## ODS Framework ETL documentation

ETL is documented further on [This Page](https://github.com/discoverfinancial/ods-framework/blob/main/docs/Data_Clients.md).

## DataClients

ETL makes use of a range of data sources. A list of what each is and how we leverage it can be seen below.

### DepsDev
[DepsDev](https://deps.dev/) creates and updates daily a dependency graph for each package. DepsDev is used in Guidance to retrieve the versions and the OpenSSF scorecards.

### Cdxgen
[Cdxgen](https://cyclonedx.github.io/cdxgen) is a tool that is able to build SBOMs from GitHub projects.  ODS App uses this data client as a way to populate the ODS data store with SBOMs.  This allows the user to interact with a populated UI and experience and experiment with the features of ODS App.

