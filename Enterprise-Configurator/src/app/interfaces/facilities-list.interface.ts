
export interface FacilitiesList{
    id: string
    nodeId:number
    mednet:any[]
    parentNodes: any[]
    name:string
    address:string
    city:any
    state : any
    contact : string
}



export interface FacilitiesCSVRecord {
    Name: string;
    AddressLine1: any;
    AddressLine2: any;
    AddressLine3: any;
    City: string;
    State: string;
    PostalCode: string;
    Country: string;
    IPRange: any;
    Status: boolean;
    Contact: string;
    Email: any;
    Department: string;
    Phone: string;  
}