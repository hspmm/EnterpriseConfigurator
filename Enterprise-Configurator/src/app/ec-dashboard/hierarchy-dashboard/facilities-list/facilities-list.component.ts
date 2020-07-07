import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator,MatTableDataSource, MatSort } from '@angular/material';
import { FacilitiesList, FacilitiesCSVRecord } from '../../../interfaces/facilities-list.interface';
import { FacilitiesMappingComponent } from '../facilities-mapping/facilities-mapping.component';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';
import csc from 'country-state-city'


@Component({
  selector: 'app-facilities-list',
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss']
})
export class FacilitiesListComponent implements OnInit {
  dataSourceOne = new MatTableDataSource()
  hierarchyFacilitiesColumns = [
    { columnDef: 'mednet', header: 'Mednet', cell: (element: any) => `${element.mednet}` },
    { columnDef: 'parentNodes', header: 'Site', cell: (element: any) => `${element.parentNodes}` },
    { columnDef: 'name', header: 'Facility', cell: (element: any) => `${element.name}` },
    { columnDef: 'address', header: 'Address', cell: (element: any) => `${element.address}` },
    { columnDef: 'city', header: 'City', cell: (element: any) => `${element.city}` },
    { columnDef: 'state', header: 'State', cell: (element: any) => `${element.state}` },
    { columnDef: 'contact', header: 'Contact', cell: (element: any) => `${element.contact}` },
  ];
  displayedColumnsOne = this.hierarchyFacilitiesColumns.map(c => c.columnDef);
  @ViewChild('TableOnePaginator', {static: false}) tableOnePaginator: MatPaginator;
  @ViewChild('TableOneSort', {static: false}) tableOneSort: MatSort;
 
 
  dataSourceTwo = new MatTableDataSource()
  importFacilitiesColumns = [
    { columnDef: 'Name', header: 'Name', cell: (element: any) => `${element.Name}` },
    { columnDef: 'AddressLine1', header: 'AddressLine1', cell: (element: any) => `${element.AddressLine1}` },
    { columnDef: 'AddressLine2', header: 'AddressLine2', cell: (element: any) => `${element.AddressLine2}` },
    { columnDef: 'AddressLine3', header: 'AddressLine3', cell: (element: any) => `${element.AddressLine3}` },
    { columnDef: 'City', header: 'City', cell: (element: any) => `${element.City}` },
    { columnDef: 'State', header: 'State', cell: (element: any) => `${element.State}` },
    { columnDef: 'PostalCode', header: 'PostalCode', cell: (element: any) => `${element.PostalCode}` },
    { columnDef: 'IPRange', header: 'IPRange', cell: (element: any) => `${element.IPRange}` },
    { columnDef: 'Status', header: 'Status', cell: (element: any) => `${element.Status}` },
    { columnDef: 'Contact', header: 'Contact', cell: (element: any) => `${element.Contact}` },
    { columnDef: 'Email', header: 'Email', cell: (element: any) => `${element.Email}` },
    { columnDef: 'Department', header: 'Department', cell: (element: any) => `${element.Department}` },
    { columnDef: 'Phone', header: 'Phone', cell: (element: any) => `${element.Phone}` },
    { columnDef: 'Star', header: 'Star', cell: (element: any) => `${element.Star}` }
  ];
  displayedColumnsTwo = this.importFacilitiesColumns.map(c => c.columnDef);
  @ViewChild('TableTwoPaginator', {static: false}) tableTwoPaginator: MatPaginator;
  @ViewChild('TableTwoSort', {static: false}) tableTwoSort: MatSort;




  public csvRecords: any[] = [];
  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;
  // facilities
  responseOfFacilities
/*   FtableKeys
  columns = [
    { columnDef: 'mednet', header: 'Mednet', cell: (element: any) => `${element.mednet}` },
    { columnDef: 'parentNodes', header: 'Site', cell: (element: any) => `${element.parentNodes}` },
    { columnDef: 'name', header: 'Facility', cell: (element: any) => `${element.name}` },
    { columnDef: 'address', header: 'Address', cell: (element: any) => `${element.address}` },
    { columnDef: 'city', header: 'City', cell: (element: any) => `${element.city}` },
    { columnDef: 'state', header: 'State', cell: (element: any) => `${element.state}` },
    { columnDef: 'contact', header: 'Contact', cell: (element: any) => `${element.contact}` },
  ];
  // displayedColumns: string[] = [];
  displayedColumns = this.columns.map(c => c.columnDef);
  dataSource = new MatTableDataSource(); */
  facilitiesArray
  isMobile

  ImportedFacilitiesArray = []
  wrongFormatFileUpload: boolean = false
  acceptedFileFormat: boolean = false
  choosenFileName: string = ''
  emptyFile: boolean = true
  selectedTab = 0

/*   @ViewChild(MatPaginator, { static: true }) hierarchyFacilitiesPaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) importFacilitiesPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) hierarchyFacilitiesSort: MatSort;
  @ViewChild(MatSort, { static: true }) sort: MatSort; */

  importFacilityHeadersArray = [
    {name : 'Name', type : 'string'},
    {name : 'AddressLine1', type : 'string'},
    {name : 'AddressLine2', type : 'string'},
    {name : 'AddressLine3', type : 'string'},
    {name : 'City', type : 'string'},
    {name : 'State', type : 'string'},
    {name : 'PostalCode', type : 'string'},
    {name : 'Country', type : 'string'},
    {name : 'IPRange', type : 'string'},
    {name : 'Status', type : 'boolean'},
    {name : 'Contact', type : 'string'},
    {name : 'Email', type : 'string'},
    {name : 'Department', type : 'string'},
    {name : 'Phone', type : 'string'}
  ]
  csvFileError= {
    status : true,
    message : ''
  }

  displayToast ={
    show : false,
    message : '',
    success : false
  }
  
  searchText
  userPrivileges
  AppLocalKeys = AppLocalStorageKeys()

  constructor(private authService: AuthenticationService, public dialogRef: MatDialogRef<FacilitiesListComponent>, @Inject(MAT_DIALOG_DATA) private modelData: any,
  private dialog: MatDialog) {
    // console.log("FACILITY ID :", this.modelData.facilitiesId)
    // console.log("hierarchy tree daya :", this.modelData.hierarchyTreeData)
    // console.log("type :", typeof 'abc@gmail.com123')
    // this.displayedColumnsTwo = this.importFacilitiesColumns.map(x => x.columnDef).concat(['myExtraColumn']);
    this.assignPrivileges()
  }

 /*  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } */

  assignPrivileges(){
    this.userPrivileges = {
      canManageFacilities : this.authService.checkPrivilege(this.AppLocalKeys.privileges.manageFacilities).length > 0
    } 
  }

  applyFilterOne(filterValue: string) {
    this.searchText = filterValue.trim().toLowerCase()
    console.log("SEARCH:",this.searchText)
    this.dataSourceOne.filter = filterValue.trim().toLowerCase();
  }
 
  applyFilterTwo(filterValue: string) {
    this.searchText = filterValue.trim().toLowerCase()
    this.dataSourceTwo.filter = filterValue.trim().toLowerCase();
  }
  clearSearch(){
    this.dataSourceTwo.filter = ""
    this.dataSourceOne.filter = ""
  }

  ngOnInit() {

    // this.getFacilities()
    this.getFlatHierarchyTree()
  }

  onTabChanged(event){
    console.log("Tabchanged : ",event.index)
    let tabIndex = event.index
    this.selectedTab = tabIndex
    if(tabIndex === 0){      
      this.getFlatHierarchyTree()
    }else{
      this.nonUsedFacilities()
    }
  }

  getFlatHierarchyTree() {
    
    this.authService.getHeirarchyList(flatHierarchy => {
      console.log("Flat hierarchy tree :", flatHierarchy)
      flatHierarchy = flatHierarchy.data || []
      this.responseOfFacilities = flatHierarchy
      this.facilitiesArray = []
      if (flatHierarchy.length > 0) {
        flatHierarchy.forEach(async flatNode => {
          console.log("Flat hierarchy tree Cmp :", flatNode.TypeOf == this.modelData.facilitiesId)
          if (flatNode.TypeOf == this.modelData.facilitiesId) {
            console.log("IN IF :", flatHierarchy)
            let nodeFacility = JSON.parse(flatNode.NodeInfo)
            let facilityObj: FacilitiesList
            facilityObj = {
              id: flatNode.Uid,
              nodeId: flatNode.NodeID,
              mednet: [],
              parentNodes: [],
              name: nodeFacility.FacilityName,
              address: '',
              city: csc.getCityById(nodeFacility.City).name,
              state: csc.getStateById(nodeFacility.State).name,
              // city: nodeFacility.City,
              // state: nodeFacility.State,
              contact: nodeFacility.Contact
            }
            let facilityParentNodes = await this.createParentNodesofFacilities(flatNode, flatHierarchy)
            //let facilitiesHavingMednet = this.findMednetsForFacilities()
            //console.log("facilityParentNodes of :",nodeFacility.FacilityName +"===>"+facilityParentNodes)
            facilityParentNodes.parentNodes.reverse()
            let treeStructuredParentNodes = facilityParentNodes.parentNodes.length > 1 ? this.createParentNodesStructure(facilityParentNodes.parentNodes) : facilityParentNodes.parentNodes[0]
            console.log(" facilityParentNodes :", facilityParentNodes)
            // facilityParentNodes = facilityParentNodes.reverse()
            facilityObj.parentNodes = treeStructuredParentNodes
            facilityObj.mednet = facilityParentNodes.mednets
            facilityObj.address = nodeFacility.AddressLine1 && nodeFacility.AddressLine2 ? nodeFacility.AddressLine1 + ',' + nodeFacility.AddressLine2 : nodeFacility.AddressLine1 ? nodeFacility.AddressLine1 : nodeFacility.AddressLine2 ? nodeFacility.AddressLine2 : ''

            this.facilitiesArray.push(facilityObj)
            console.log(" this.facilitiesArray :", this.facilitiesArray)
            /* this.hierarchyTableColumns()
            this.displayedColumnsOne = this.columns.map(c => c.columnDef); */
            // this.dataSourceOne = new MatTableDataSource();
            this.dataSourceOne.data = this.facilitiesArray
            this.dataSourceOne.paginator = this.tableOnePaginator;
            this.dataSourceOne.paginator.firstPage();
            this.dataSourceOne.sort = this.tableOneSort;
            /* this.hierarchyTableColumns()
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.dataSource = new MatTableDataSource();
            this.dataSource.data = this.facilitiesArray
            this.dataSource.paginator = this.hierarchyFacilitiesPaginator;
            this.dataSource.paginator.firstPage();
            this.dataSource.sort = this.hierarchyFacilitiesSort; */
          }
        });
      }
    })
  }


  /* hierarchyTableColumns() {
    this.columns = [
      { columnDef: 'mednet', header: 'Mednet', cell: (element: any) => `${element.mednet}` },
      { columnDef: 'parentNodes', header: 'Site', cell: (element: any) => `${element.parentNodes}` },
      { columnDef: 'name', header: 'Facility', cell: (element: any) => `${element.name}` },
      { columnDef: 'address', header: 'Address', cell: (element: any) => `${element.address}` },
      { columnDef: 'city', header: 'City', cell: (element: any) => `${element.city}` },
      { columnDef: 'state', header: 'State', cell: (element: any) => `${element.state}` },
      { columnDef: 'contact', header: 'Contact', cell: (element: any) => `${element.contact}` },
    ];
    return this.columns
  } */



  async createParentNodesofFacilities(flatNode, flatHierarchy) {
    let facilitiesParentAndMednetsObj = {
      parentNodes: [],
      mednets: []
    }
    let preceedingNode = await this.findPreceedingNode(flatNode.ParentID, flatHierarchy)
    console.log('preceedingNode:', preceedingNode)
    if (preceedingNode[0]) {
      if ((preceedingNode[0].TypeOf).toLowerCase() == 'mednet') {
        facilitiesParentAndMednetsObj.mednets.push(preceedingNode[0].NodeName)
      }

      facilitiesParentAndMednetsObj.parentNodes.push(preceedingNode[0].NodeName)
      if (preceedingNode[0].ParentID != null && preceedingNode[0].ParentID < flatNode.NodeID) {
        let addtnlParentNode = await this.createParentNodesofFacilities(preceedingNode[0], flatHierarchy)
        //console.log('addtnlParentNode:',addtnlParentNode)
        if (addtnlParentNode.parentNodes.length > 0) {
          //console.log('addtnlParentNode:',addtnlParentNode)
          /* if((addtnlParentNode[0].TypeOf).toLowerCase() == 'mednet'){
            facilitiesParentAndMednetsObj.mednets.push(addtnlParentNode.mednets[0].NodeName)
          } */
          addtnlParentNode.parentNodes.forEach(node=>{
            facilitiesParentAndMednetsObj.parentNodes.push(node)
          })
          
        }
        if (addtnlParentNode.mednets.length > 0) {
          addtnlParentNode.mednets.forEach(nodes=>{
            facilitiesParentAndMednetsObj.mednets.push(nodes)
          })
          
        }
      }
    }
    return facilitiesParentAndMednetsObj
  }

  findPreceedingNode(parentId, flatHierarchy) {
    return flatHierarchy.filter(node => {
      if (node.NodeID === parentId) {
        return node
      }
    })
  }

  createParentNodesStructure(facilityParentNodes) {
    let parentNodeStructure = facilityParentNodes[0]
    for (let i = 1; i < facilityParentNodes.length; i++) {
      parentNodeStructure = parentNodeStructure + ' > ' + facilityParentNodes[i]
    }
    console.log("parentNodeStructure :", parentNodeStructure)
    return parentNodeStructure
  }


  /*   getFacilities(){
      this.authService.getFacilitiesList((response,err)=>{
        if(err){
  
        }else{
          console.log("List of Facilities:",response)
          this.responseOfFacilities = response.data || []
          if(this.responseOfFacilities){
            let facilities = []
            this.responseOfFacilities.forEach(Fdata => {
              let nodeFacility = JSON.parse(Fdata.NodeInfo)
              nodeFacility['Id'] = Fdata.Id
              nodeFacility['NodeId'] = Fdata.NodeId
              facilities.push(nodeFacility)
            });
            // this.facilities = facilities
            this.createFacilityTable(facilities)
  
            console.log("List of Facilities:",facilities)
          }
          
        }
      })
    }
  
    createFacilityTable(facilities){
      let facilityTableKeys = []
      for(let key in facilities[0]){
        // console.log("F KEYS:",key)
        facilityTableKeys.push(key)    
      }
      // this.displayedColumns = facilityTableKeys
      // this.displayedColumns = ["FacilityName", "AddressLine1", "Country", "IPRange", "Contact", "Email", "Department"]
      this.displayedColumns = ["Mednet","Site","FacilityName", "AddressLine1", "City", "State", "Contact"]
      this.FtableKeys = facilityTableKeys
      this.dataSource.data = facilities
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.firstPage();
      this.dataSource.sort = this.sort;
      console.log("F KEYS:",facilityTableKeys)
    } */

  goToSelectedFacility(facilityId) {
    console.log("Selected Facility:", facilityId)
    let goToNode = this.responseOfFacilities.filter(facility => facility.Uid === facilityId)
    console.log(goToNode)
    this.dialogRef.close({
      msg : "navigateToNode",
      response : goToNode[0]
    });
  }

  close() {
    this.dialogRef.close();
  }


  isCSVFile(file: any) {
    console.log(file)
    return file.name.endsWith(".csv");
  }

  getHeaderArrayFromCSVFile(csvRecordsArr: any) {
    console.log("csvRecordsArr :", csvRecordsArr)
    let headers = csvRecordsArr[0].split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      if(this.findRequiredHeader(headers[j])){
        headerArray.push(headers[j])
      }      
    }
    return headerArray
  }

  findRequiredHeader(requestedHeader){
    let acceptedHeader = this.importFacilityHeadersArray.find(requiredHeader => (requiredHeader.name).toLowerCase() === (requestedHeader).toLowerCase() )
    // let acceptedHeader = this.importFacilityHeadersArray.find(requiredHeader => ((requiredHeader.name).toLocaleLowerCase() === (requestedHeader).toLocaleLowerCase() && ((requiredHeader.type).toLocaleLowerCase() === (typeof requestedHeader).toLocaleLowerCase())))
    console.log("FIND acceptedHeader:",acceptedHeader)
    return acceptedHeader
  }

 

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let dataArr = []
    console.log("headerLength :", headerLength)
    console.log("csvRecordsArray :", csvRecordsArray)
    console.log("csvRecordsArray :", csvRecordsArray[0])
    let keys = csvRecordsArray[0].split(',');
    let foundUnAcceptedValueInCsvFile = false
    for (let i = 1; i < csvRecordsArray.length; i++) {
      let values = csvRecordsArray[i].split(',');
      // FOR EACH ROW IN CSV FILE IF THE NUMBER OF COLUMNS         
      // ARE SAME AS NUMBER OF HEADER COLUMNS THEN PARSE THE DATA 
      if (values.length == headerLength) {
        let csvRecord: CSVRecord = new CSVRecord();
        // let csvRecord: FacilitiesCSVRecord
        for (let j = 0; j < values.length; j++) {
          //console.log("HEADRER##:", header[j])
          let fileHeaderKey = keys[j]
          let fileRowValue = values[j].trim()
          if(((values[j]).toLowerCase() === 'true') || ((values[j]).toLowerCase() === 'false')){
            console.log("Coming to boolean detected :",values[j])
            if(((values[j]).toLowerCase() === 'true')){
              fileRowValue = true
            }else{
              fileRowValue = false
            }
            
          }
          
          console.log("fileRowValue:", fileRowValue)
          if(this.findRequiredTypeValuesInCsvFile(fileHeaderKey, fileRowValue)){
            csvRecord[fileHeaderKey] = fileRowValue;
            // csvRecord["IsActive"] = true
          }else{
            foundUnAcceptedValueInCsvFile = true
          }

          // csvRecord = this.which(data[j],header[j])

        }
        console.log("csvRecord##:", csvRecord)
        if(!foundUnAcceptedValueInCsvFile){
          dataArr.push(csvRecord);
        }
        
      }
    }
    return dataArr;
  }

  findRequiredTypeValuesInCsvFile(key, value){
    // console.log("value:", value)
    // console.log("TYPE OF:", typeof value)
    let acceptedValueFromCsvFile = this.importFacilityHeadersArray.find(requiredHeader => ((requiredHeader.name).toLowerCase() === (key).toLowerCase() && ((requiredHeader.type).toLowerCase() === (typeof value).toLowerCase())))
    // console.log("FIND acceptedValueFromCsvFile:",acceptedValueFromCsvFile)
    return acceptedValueFromCsvFile
  }

  hasDupes(array) {
    // let name = (this.importFacilityHeadersArray[0].name).toLowerCase()
    var hash = Object.create(null);
    return array.some(function (a) {
      // console.log("NAMES:",a.Name)
      return a.Name && (hash[a.Name] || !(hash[a.Name] = true));
    });
  }
  async assignCountryStateCityCodes(acceptedCsvRecords){
    let allRecords=[]
    let correctRecord = true
    for(let i=0;i<acceptedCsvRecords.length; i++) {
      let record = acceptedCsvRecords[i]
      record = await this.getCountryId(record)
      // console.log("searchable record after country:",record)
      console.log("Found record of country:",record)
      if(record){        
        record = await this.getStateId(record)
        console.log("Found record of State:",record)
        if(record){          
          record = await this.getCityId(record)
          console.log("Found record of City:",record)
          if(record){
            console.log("Found record of City:",record)
            allRecords.push(record)
          }else{
            correctRecord = false
          }
          
        }else{
          correctRecord = false
        }        
      }else{
        correctRecord = false
      }
      
      
      if(i == acceptedCsvRecords.length-1){
        console.log("allRecords:",allRecords)
        console.log("correctRecord:",correctRecord)
        if(!correctRecord){
          return correctRecord
        }else{
          return allRecords
        }
      }      
    }

  }

  async getCountryId(record){
    let countries = csc.getAllCountries()
    let foundCountry = countries.filter(country=>{
      let recordCountry = (record.Country).replace(/ /g,"")
      let relatedCountryName = (country.name).replace(/ /g,"")
      let relatedCountryId = (country.id).replace(/ /g,"")
      if((recordCountry).toLowerCase() == (relatedCountryName).toLowerCase()){
        console.log("Found Country:",country)
        return country
      }else if(parseInt(recordCountry) == parseInt(relatedCountryId)){
        return country
      }
    })
    console.log("Final result of country search record:",foundCountry)
    if(foundCountry && foundCountry.length > 0){
      record.Country = foundCountry[0].id
      return record
    }else{
      return false
    }
    
  }

  async getStateId(record){
    let states = csc.getStatesOfCountry(record.Country)
    console.log("States by countryID:",states)
    let foundState = states.filter(state=>{
      let recordState = (record.State).replace(/ /g,"")
      let relatedStateName = (state.name).replace(/ /g,"")
      let relatedStateId = (state.id).replace(/ /g,"")
      if((recordState).toLowerCase() == (relatedStateName).toLowerCase()){
        console.log("Found State:",state)
        return state
      }else if(parseInt(recordState) == parseInt(relatedStateId)){
        return state
      }
    });
    console.log("Final result of State search record:",foundState)
    if(foundState && foundState.length > 0){
      record.State = foundState[0].id
      return record
    }else{
      return false
    }
  }

  async getCityId(record){
    let cities = csc.getCitiesOfState(record.State)
    let foundCity = cities.filter(city=>{
      let recordCity = (record.City).replace(/ /g,"")
      let relatedCityName = (city.name).replace(/ /g,"")
      let relatedCityId = (city.id).replace(/ /g,"")
      if((recordCity).toLowerCase() == (relatedCityName).toLowerCase()){
        console.log("Found City:",city)
        return city
      }else if(parseInt(recordCity) == parseInt(relatedCityId)){
        return city
      }
    });
    if(foundCity && foundCity.length > 0){
      record.City = foundCity[0].id
      return record
    }else{
      return false
    }
  }



  filechangeListner($event: any): void {
    let text = [];
    let files = $event.srcElement.files;
    this.wrongFormatFileUpload = false
    this.acceptedFileFormat = false
    this.choosenFileName = ''
    //console.log("files:", files)
    if (this.isCSVFile(files[0])) {

      this.choosenFileName = files[0].name
      let input = $event.target;
      //console.log("input:", input)
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = async () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
        let csvHeadersRow = this.getHeaderArrayFromCSVFile(csvRecordsArray);
        console.log("headersRow:", csvHeadersRow)
        if(csvHeadersRow.length === this.importFacilityHeadersArray.length){          
         
            let acceptedCsvRecords = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, csvHeadersRow.length);
            console.log("acceptedCsvRecords:", acceptedCsvRecords)
            console.log("acceptedCsvRecords.length:", acceptedCsvRecords.length)
            console.log("csvRecordsArray:", csvRecordsArray)
            console.log("csvRecordsArray.length:", csvRecordsArray.length)
            console.log("HAS DUPLICATES:",this.hasDupes(acceptedCsvRecords))
            if((this.hasDupes(acceptedCsvRecords))){ //if duplicatesFound
              this.wrongFormatFileUpload = true
              this.csvFileError = {
                status : false,
                message : 'Duplicates found in the file'
              }
            }else{ // if no duplicates
              let allAcceptedRecords = await this.assignCountryStateCityCodes(acceptedCsvRecords)
              console.log("allAcceptedRecords:",allAcceptedRecords)
              if(allAcceptedRecords !== false){
                if(acceptedCsvRecords.length === (csvRecordsArray.length-2)){
                  this.emptyFile = false
                  this.acceptedFileFormat = true
                  this.csvRecords = acceptedCsvRecords
                }else{
                  this.wrongFormatFileUpload = true
                  this.csvFileError = {
                    status : false,
                    // message : 'Few values are not in required type'
                    message : '"Type" mismatches in the values'
                  }
                }
              }else{
                this.wrongFormatFileUpload = true
                this.csvFileError = {
                  status : false,
                  message : '"Country/state/city" is invalid in the file'
                }
              }

            }



        }else{
          this.wrongFormatFileUpload = true
          this.csvFileError = {
            status : false,
            message : 'Required fields not found in the file'
          }
        }


      };

      reader.onerror = function () {
        alert('Unable to read ' + input.files[0]);
      };

    } else {
      this.emptyFile = false
      this.wrongFormatFileUpload = true
      this.csvFileError = {
        status : true,
        message : 'Required fields not found  the file'
      }
      this.fileReset();
    }
  }

  fileReset() {
    this.emptyFile = true
    this.acceptedFileFormat = false
    this.fileImportInput.nativeElement.value = "";
    this.csvRecords = [];
  }

  uploadFacilities(csvRecords) {
    if (csvRecords && csvRecords.length > 0) {
      this.authService.storeImportFacilities(csvRecords, (resp, err) => {
        if (err) {
          console.log("Error of import facilities:", err)
          this.showToaster('Error while uploading fscilities', false)
        } else {
          console.log("Success of import facilities:", resp)
          this.selectedTab = 1
          this.emptyFile = true
          this.wrongFormatFileUpload = false
          this.acceptedFileFormat = false
          this.showToaster('Successfully uploaded fscilities', true)
        }
      })
    }else{
      this.showToaster('Files are missing', false)
    }
  }


  nonUsedFacilities() {
    this.authService.getImportedFacilities((resp, err) => {
      if (err) {
        console.log("Error of import facilities:", err)
      } else {
        this.ImportedFacilitiesArray = []
        // this.returnColumns()
        /* this.displayedColumns = this.columns.map(c => c.columnDef);
        this.dataSource = new MatTableDataSource();
        this.dataSource.data = resp.data
        this.dataSource.paginator = this.importFacilitiesPaginator;
        this.dataSource.paginator.firstPage();
        this.dataSource.sort = this.sort; */
        // this.displayedColumns = this.columns.map(c => c.columnDef);
        // this.dataSource = new MatTableDataSource();
        if(resp.data.length > 0){
          resp.data.forEach(facility => {
            facility.City = csc.getCityById(facility.City).name
            facility.State = csc.getStateById(facility.State).name
          });
          console.log("import facilities:", resp.data)
        }
        this.dataSourceTwo.data = resp.data
        this.dataSourceTwo.paginator = this.tableTwoPaginator;
        this.dataSourceTwo.paginator.firstPage();
        this.dataSourceTwo.sort = this.tableTwoSort;
        this.ImportedFacilitiesArray = resp.data
        // this.displayedColumns = ["Name","AddressLine1","AddressLine2","AddressLine3", "City", "State","PostalCode","IPRange","Status", "Contact","Email","Department","Phone"]
        console.log("Success of import facilities:", resp)
        // this.dataSource.data = resp.data
      }
    })
  }

  /* returnColumns() {
    this.columns = [
      { columnDef: 'Name', header: 'Name', cell: (element: any) => `${element.Name}` },
      { columnDef: 'AddressLine1', header: 'AddressLine1', cell: (element: any) => `${element.AddressLine1}` },
      { columnDef: 'AddressLine2', header: 'AddressLine2', cell: (element: any) => `${element.AddressLine2}` },
      { columnDef: 'AddressLine3', header: 'AddressLine3', cell: (element: any) => `${element.AddressLine3}` },
      { columnDef: 'City', header: 'City', cell: (element: any) => `${element.City}` },
      { columnDef: 'State', header: 'State', cell: (element: any) => `${element.State}` },
      { columnDef: 'PostalCode', header: 'PostalCode', cell: (element: any) => `${element.PostalCode}` },
      { columnDef: 'IPRange', header: 'IPRange', cell: (element: any) => `${element.IPRange}` },
      { columnDef: 'Status', header: 'Status', cell: (element: any) => `${element.Status}` },
      { columnDef: 'Contact', header: 'Contact', cell: (element: any) => `${element.Contact}` },
      { columnDef: 'Email', header: 'Email', cell: (element: any) => `${element.Email}` },
      { columnDef: 'Department', header: 'Department', cell: (element: any) => `${element.Department}` },
      { columnDef: 'Phone', header: 'Phone', cell: (element: any) => `${element.Phone}` }
    ];
    return this.columns
  } */


  exportAsCSV() {
    // console.log("DATA SOURCE:", this.dataSource.data)
    let facArr = this.ImportedFacilitiesArray
    const resultantExportFacilities = facArr.map(({Uid,createdAt,updatedAt,...rest}) => ({...rest})); // Removing Uid,createdAt,UpdatedAt columns from the DB array
    this.exportToCsv('facilities.csv', resultantExportFacilities);
  }


  exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }


  /****************** Facility mapping with tree *****************************/
  async mapfacilityTohierarchyTree(row){
    console.log("map Facility:",row)
    row = await this.getStateId(row)
    row = await this.getCityId(row)
    if(this.userPrivileges.canManageFacilities){
      const dialogRef = this.dialog.open(FacilitiesMappingComponent,{
        data : {
          facilityId : this.modelData.facilitiesId,
          selectedMapingFacility: row,
          hierarchyTreeData : this.modelData.hierarchyTreeData
          // hierarchyTreeData : this.responseOfFacilities
        },
        width:'1450px'
      });
  
      dialogRef.afterClosed().subscribe((responseObj) => {
        console.log("Closing facilities list:",responseObj)
  
        if(responseObj){
          this.dialogRef.close({
            msg : "newNodes",
            response : responseObj
          })
        }
        
      })
    }
    return false
  }

  showToaster(toastMsg, isSuccess){
    console.log("TOASTER :",toastMsg + "success :",isSuccess)
    this.displayToast = {
      show : true,
      message : toastMsg,
      success : isSuccess
    }

    setTimeout(()=>{
      this.displayToast.show = false
    },2000)
  }

}

export class CSVRecord {

  public Name: string;
  public AddressLine1: any;
  public AddressLine2: any;
  public AddressLine3: any;
  public City: string;
  public State: string;
  public PostalCode: string;
  public Country: string;
  public IPRange: any;
  public Status: boolean;
  public Contact: string;
  public Email: any;
  public Department: string;
  public Phone: string;
  // public IsActive: boolean;

  constructor() {

  }
}
