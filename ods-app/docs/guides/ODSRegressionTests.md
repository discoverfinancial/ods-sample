## Test Plans

### Software List

#### View Details
Load http://localhost:<port>/list

    1. Make sure "All" is checked and "*" is in the search field
	2. Click search
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Click "View Software Details"
	5. View contents of Metadata tab
	6. Click "Back to software list"
    
#### View Guidance
Load http://localhost:<port>/list

	1. Make sure "All" is checked and "*" is in the search field
	2. Click search
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Select "View all Software versions"
	5. Click "Back to software list"
	6. Click three-dot dropdown menu in Actions column of the first result
	7. Select "View Guidance"
	8. See page with "*" at the top, with Components, versions found, and most popular versions
	9. Click "Guidance" in tabs
	10. View guidance
	11. Click "Versions" in tabs
	13. Click "Show software that uses out-of-guidance versions"
	14. A new browser tab opens that says "Software that uses not-in-guidance versions of spring-boot"
	15. Close browser tab
    16. Click "Back to software list" in original browser tab
    
#### View Software that uses any version
Load http://localhost:<port>/list

	1. Make sure "All" is checked and "*" is in the search field
	2. Click search
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Select "View Guidance"
	5. View Guidance
	6. Click "Back to software list"
	7. Click three-dot dropdown menu in Actions column of the first result
	8. Select "View Software that uses any version"
	9. A page loads that says "Software that uses spring-boot".  A table with a large number of entries will display.
	10. Click Clear button.  Software List page will load
    
#### View Software that uses this version
Load http://localhost:<port>/list

	1. Make sure "All" is checked and "*" is in the search field
	2. Click search
	3. Click three-dot dropdown menu in Actions column of the first result
    4. Select "View Software that uses this version".  Note the version that you selected to view information about.

 	- View Details
		1. A page loads that says "Software that uses spring-boot@<selected version>".  A table will display.
		2. Click three-dot dropdown menu in Actions column of the first result
		3. Select "View Software Details"
		4. View details
		5. Click the **browser's** back button to return to the list of products that use the selected version of "*"
    
#### View Software that uses any version
Load http://localhost:<port>/list

	1. Make sure "All" is checked and "*" is in the search field
	2. Click Search
	3. Click three-dot dropdown menu in Actions column of the first result
    4. Select "View Software that uses any version"

    - View Details
		1. A page loads that says "Software that uses spring-boot".  A table with a large number of entries will display.  Should see lots of applications that have a Software Type value of "Application"
		2. In the name filter field, type "recover".  All software names should contain the consecutive characters "recover"
		3. Click three-dot dropdown menu in Actions column of the first result
		4. Select "View Software Details".  View details.
        5. Click on the link for LeanIX id property
        6. A popup should display a LeanIX Document
        7. Click "OK" to dismiss the popup
		8. Click the **browser's** back button to return to the list of products that use "*"


#### Most Used
Load http://localhost:<port>/list

	1. Select "Most Used Software" Tab
    2. In the textfield below the "Name" column header, type "slf4j-api"
	3. The table will display a record with the name "slf4j-api"
	4. Click on the Action Ellipses
	5. Only the following options should be visible
		a. View Software Details
		b. View Guidance
	6. Select "View Software Details"
	7. A new browser window is opened that says "slf4j-api".  A table with a number of entries will display.
    8. Close the tab
    9. Click on the Action Ellipses
	10. Select "View Guidance"
	11. View Guidance
    12. Click "Back to software list"


#### Top Level Dependencies
Load http://localhost:<port>/list

    1. Select "Top Level Dependencies" Tab
    2. In the textfield below the "Name" column header, type "react"
    3. Every row should have a name value that contains the consecutive characters "react"
    4. Click three-dot dropdown menu in Actions column of the first result.  Note the name of the software package for this row.
    5. Only the following options should be visible
        a. View Software Details
        b. View Guidance
    6. Select "View Software Details"
	7. A new browser window is opened that says "<the name of the software package that you selected>".  A table displaying multiple versions of the software package will display.
    8. Close the tab
    9. Click on the Action Ellipses for a row that has a value in its "Guidance" column
    10. Select "View Guidance"
    11. View Guidance information
    12. Click "Back to software list"

### Queries
#### Query Components
Load http://localhost:<port>/list

	1. Select Queries Tab
    2. A page loads that says "Run Saved Queries on ODS App Database".  An empty table will display.
	3. In Query to Run Dropdown, select "Example: Audit - List OSS Components by Director"
	4. Select Run button
	5. Accept pre-selected email address.  Otherwise provide a different director's email address from inside Discover.
    6. Click the "OK" button
	7. View Results in table
    
#### Query Export
Load http://localhost:<port>/list

	1. Select Queries Tab
	2. Select Query to Run from Dropdown
        IE. Example: Query SBOM for '*spring*'
	3. Select Run button
	4. Provide input in prompt if required
	5. View Results in table
	6. Click on "Export Table" download link from the top, far-right corner of the data grid
    7. Confirm export matches displayed information by loading the downloaded .csv file into spreadsheet software like MS Excel or Apple Numbers application.
    
#### Save Database Query
Load http://localhost:<port>/list

	1. Select Database Query Tab
	2. Select "SBOM" from Select Table Dropdown
	3. Select any query from MongoDB Query
        IE. Example: Query Guidance for '*spring*'
	4. Make any modifications to query in text box as desired 
	5. Enter Projection {"metadata.component.name": 1, "state": 1}
	6. Increase maximum number of documents to display if desired
	7. Select Run Query and wait for operation to complete
	8. View Results in provided output screen.  Results should only contain the name and state fields noted in the Projection object
	9. Select Save Query 
	10. Update Query Name with relevant information to make a unique query name 
	11. Provide a description
	12. Ensure value selected in the Database Dropdown matches the Select Table Dropdown value that you originally specified
	13. Check Public if desired
	14. Ensure query in text box matches input on previous screen
	15. Ensure Projection matches input from previous screen
	16. Select Save
	17. Scroll the page to make the MongoDB Query Field visible
	18. Click dropdown and confirm the query you saved is in the list
    19. Return to the software list by selecting the "Software" tab

### ACLs
#### Software List / Guidance
Load http://localhost:<port>/list

	1. Below the Header "Software Supply Chain Data Inspector" there should be no buttons with the following labels
		a. Visual Inspector
		c. Attestation Manager
		d. Administrator
	2. Select "Software" Tab 
	3. Make sure "All" is checked and "*" is in the search field
	4. Click search
	5. In the below table click on the Action Ellipses for a search result
	6. In the Dropdown Menu the following options should not be visible
		a. Delete Software
		b. Create Attestation
	7. Select "View Guidance" from the dropdown
	8. There should be no editable options on this page
	9. Select "View" below Guidance history 
    10. On the new page select the Eye icon on the table
    11. A new browser window is opened that shows the selected Guidance
 
 #### Queries
 
 ##### Queries
 Load http://localhost:<port>/list

    1. Select "Queries" Tab
    2. In Query to Run Dropdown, select "Example: Query SBOM for '*spring*'"
	3. Select Run button
    4. In the below table click on the Action Ellipses for a search result
    5. In the Dropdown Menu the following options should not be visible
        a. Delete Software
        b. Create Attestation

##### Database Query
Load http://localhost:<port>/list

    1. Select "Database Query" Tab
    2. In the Select Table Dropdown select "SBOM"
    3. In the MongoDB Query select "Example: Query SBOM for '*spring*'
    4. Scroll down and select Run Query
    5. The following buttons should not be clickable 
        a. Update Query
        b. Delete Query
        
        
### Datagrid Testing

There are a lot of different datagrid configurations in ODS App.  Below are instructions for loading and initializing each type of datagrid in prepartion for testing.  Following these sections is a base test that can be used to exercise any datagrid in ODS App once it is loaded and initialized.

#### Datagrid Variations

Run the following instructions to test all of the different datagrid types in ODS App.  Each section below will help you properly initialize the selected datagrid in order to run the Datagrid Test that follows.

##### ODS App List
* Load http://localhost:<port>/list

	1. In the search field, type "\*spring\*"
	2. Click the Search button
	3. Run the [datagrid test](#Datagrid-Test) below 

##### View Software Details - Compositions
* Load http://localhost:<port>/list

	1. In the search field, type "\*spring\*"
	2. Click the Search button
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Click "View Software Details"
	5. Select the "Compositions" tab
	4. Run the [datagrid test](#Datagrid-Test) below 

##### View Software Details - Components
* Load http://localhost:<port>/list

	1. In the search field, type "\*spring\*"
	2. Click the Search button
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Click "View Software Details"
	5. Select the "Components" tab
	6. Run the [datagrid test](#Datagrid-Test) below

##### Query - Unknown Type
* Load http://localhost:<port>/list

```
const ret = [{ "firstProperty": "first property value", "secondProperty": "second property value" }, { "thirdProperty": "third property value", "fourthProperty": "fourth property value" }]
setDocType("unknown");
return ret;
```
* Copy the above JavaScript code into your clipboard

    1. 	Select the "Database Query" tab
    2. 	Paste the above JavaScript code from your clipboard into the "Query or Script" field
    3. 	Click "Save Query" button.  In the popup that appears:
        a. Give the query a name that you'll remember
        b. Click the "Save" button
    4. Select the "Queries" tab at the top of the panel
    5. In the "Select Query to Run" dropdown, select the query that you just saved
    6. Click on the "Run" button
    7. Run the [datagrid test](#Datagrid-Test) below
    8. Select the "Database Query" tab
    9. In the "MongoDB Query" dropdown, select the query that you saved
    10. Click on the "Delete Query" button to cleanup your query

##### Logs
* Load http://localhost:<port>/logs

	1. Run the [datagrid test](#Datagrid-Test) below
	    a. You should only be able to see log items associated with your user account

##### Most Used
* Load http://localhost:<port>/list

    1. Select the "Most Used Software" tab
	2. Run the [datagrid test](#Datagrid-Test) below
	    a. **Note**: there will not be "Default" or "All" radio buttons for this datagrid

##### Versions
* Load http://localhost:<port>/list

    1. In the search field, type "*"
	2. Click the Search button
	3. Click three-dot dropdown menu in Actions column of the first result
	4. Click "View all Software Versions"
	5. Run the [datagrid test](#Datagrid-Test) below

#### Datagrid Test
	1. Open a ODS App page to a loaded datagrid (see more above)
	2. Scroll so that the right-most column (that is not the Actions column) is visible
    3. If available, toggle between "Default" and "All" using the radio buttons at the top of the data grid.
        a. "All" should expose more columns that "Default".
    4. Ensure that "All" is selected before continuing.
    5. In the filter field of the first column in the datagrid, type a value such that rows will hide that don't match the filter.
        a. rows should be hidden
        b. Num Rows count should decrease
    6. Add a "*" to the end of the filter string.
        a. All rows should disabppear.
        b. Num Rows count should be 0.
    7. Remove the "*" from the filter string.
        a. All rows matching the filter string should re-appear
        b. Num Rows should change to reflect the count of rows shown.
    8. Click on the arrow dropdown next to the column filter field to expose a menu with additional filtering options.
        a. "Contains" should be selected by default
    9. Select a different option from the dropdown on the additional filtering menu to change the filtering type on the column.
        a. The rows should filter correctly based on the option selected.
    10. Press the "Esc" key on your keyboard to dismiss the additional filtering options.
    11. Remove the filter string from the filter field.
        a. All rows should re-appear
        b. Num Rows should change to reflect the count of rows shown.
    12. Click on the column header of the first column to affect the sort order of the column.
        a. An up arrow should appear to the right of the column header text.
        b. The data in the column should be in ascending order
    13. Click on the column header again to affect the sort order of the column.
        a. A down arrow should appear to the right of the column header text.
        b. The data in the column should be in descending order
    14. Click on the column header again to affect the sort order of the column.
        a. No arrow should appear to the right of the column header text.
        b. The data in the column should be in default order.
    15. Scroll to the right until you encounter a Date-based column.  If no date column exists, skip the remaining steps.
    16. Click on the column header until the date column is sorted in ascending order.
    17. Enter a date in the date column's filter field that is between two different dates in the column.
        a. The rows shown should change as those items before the given date should be filtered out
    18. Click on the arrow dropdown next to the column header to expose a menu with additional filtering options.
        a. "After" should be selected by default
    19. Select "Before" from the first dropdown on the additional filtering menu.
        a. The rows previously hidden should be shown, the other rows hidden.
    20. Dismiss the additional filtering menu.
    21. Click on the calendar icon in the filter field
        a. You should see a dropdown view of the days in the month currently selected in the filter field.
    22. Click on the "Clear" link in the bottom left of the dropdown
        a. all rows should now be visible.