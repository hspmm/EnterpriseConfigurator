/**************************************************************
**************** DO NOT EDIT THIS PAGE ************************
***************************************************************/

module.exports = {

    /*******************************
    ********** ERROR CASE **********
    ********************************/ 
    ERROR : {
        RESTARTING_INDIVIDUAL_PLUGIN_SERVICES : [9032,"Error while restarting individual plugin services",500],
        RESTARTING_ALL_PLUGIN_SERVICES: [9031,"Error while restarting the services",500],
        APP_CONFIG_INFO : [9029,"Error while getting app config Info", 500],
        UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES : [9030,"Error while updating plugin services", 500],
        GET_HIERARCHY : [9000,"Error while Getting Hierarchy",500],
        CREATE_HIERARCHY : [9001,"Error while Creating Hierarchy",500],
        ADD_ELEMENT_TO_HIERARCHY : [9006,"Error while adding an element into hierarchy",500],
        HIERARCHY_ELEMENT_DATA_BY_NODEID : [9007,"Error while fetching the hierarchy node info by node-id",500],
        UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9008,"Error while updating hierarchy element data by node-id",500],
        NODEID_NOT_FOUND_UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9009,"'NodeID' not found in the request to fetch element data",500],
        NODEID_NOT_FOUND_REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9010,"'NodeID' not found in the request to remove element data",500],
        REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9011,"Error while deleting element data",500],
        NODEID_NODENAME_NOT_FOUND_UPDATE_HIERARCHY_NODE : [9012,"'NodeName' & 'NodeID' not found in the request",500],
        UPDATE_HIERARCHY_NODE : [9013,"Error while updating hierarchy node",500],
        LEVELID_NOT_FOUND_UPDATE_HIERARCHY_LEVEL : [9014,"'LevelID' not found in the request",500],
        UPDATE_HIERARCHY_LEVEL : [9015,"Error while updating hierarchy levels",500],
        CREATE_HIERARCHY_LEVEL : [9016,"Error while creating hierarchy levels",500],
        GET_HIERARCHY_LEVEL : [9022,"Error while getting hierarchy levels",500],
        GET_HIERARCHY_TREE : [9017,"Error while getting hierarchy Tree",500],
        GET_FACILITIES_LIST : [9021,"Error while Fetching Facilities list",500],
        ADD_MEDNET_FACILITIES : [9023,"Error while doing some operations",500],
        GET_ADDITIONAL_PROPERTIES : [9029,"Error while Getting Additional properties",500],


        IMPORT_FACILITIES : [9030,"Error while importing facilities",500],
        GET_IMPORTED_FACILITIES : [9031,"Error while fetching imported facilities",500],
        EXPORT_ERROR_LOG_FILE : [9032,"Error while fetching Error log file",500],
        EXPORT_EC_SERVER_LOG_FILE : [9033,"Error while fetching server log file",500],
        EXPORT_GLOBAL_LOG_FILE : [9034,"Error while fetching global api log file",500],
        GET_LICENSEMANAGER_INFO : [9035,"Error while fetching license manager plugin info",500],
        GET_NOTIFICATION_VIEWER_URL : [9036,"Error while fetching notification manager Ui Url",500],

        ALL_REGISTERED_PLUGINS : [9018,"Error while fetching all the registered plugins",500],
        PLUGIN_ID_NOT_FOUND_REGISTERED_PLUGIN : [9020,"'PluginID' not found in the request",500],
        REGISTERED_PLUGIN_BY_ID : [9019,"Error while fetching registered plugins",500],
        DETECTING_PLUGINS : [9002,"Error while detecting the plugins and their information",500],
        PLUGIN_INFO_NOT_MATCHED_IN_ADDELEMENT : [9003,"Requested Plugin information not found to add an element",404],
        PLUGIN_INFO_NOT_FOUND_IN_ADDELEMENT : [9004,"Error while fetching the registered plugin information",500],
        PLUGIN_NOT_REGISTERED_TO_ADDELEMENT : [9005,"Requested plugin is not registered to add an element",500],

        PLUGIN_API_REHOST : [9023,"Error while fetching data from the application",300],
        PLUGIN_API_REHOST_NOT_FOUND : [9024,"Requested API not found",404],
        REGISTER_APP_WITH__MSAS : [9025,"Error while fetching the information",500],

        AUTEHNTICATION_FAILED_DUETO_NOTREGISTERED : [9026,"Authentication failed due to not registered your application",404],
        AUTEHNTICATION_FAILED : [9027,"Authentication failed",401],
        AUTEHNTICATION_FAILED_INTERNAL_ERROR : [9028,"Authentication failed",500],

        DB_FETCH : ['',"Something went wrong while doing operations with Database",'']
    },


    /*******************************
    ********** SUCCESS CASE ********
    ********************************/
    
    SUCCESS : [0,"Success",200]

    /* MESSAGES : {
        GET_HIERARCHY : [9000,"Success while Getting Hierarchy",200],
        CREATE_HIERARCHY : [9001,"Success while Creating Hierarchy",200],
        ADD_ELEMENT_TO_HIERARCHY : [9006,"Successfully added an element into hierarchy",200],
        HIERARCHY_ELEMENT_DATA_BY_NODEID : [9007,"Success fetched hierarchy nod info with node-id",200],
        UPDATE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9008,"Success updating hierarchy element data by node-id",200],
        REMOVE_HIERARCHY_ELEMENT_DATA_BY_NODEID : [9011,"Success removed the eleent",200],
        UPDATE_HIERARCHY_NODE : [9013,"Successfully updated hierarchy node",200],
        UPDATE_HIERARCHY_LEVEL : [9015,"Successfull updated hierarchy levels",200],
        CREATE_HIERARCHY_LEVEL : [9016,"Successfully created hierarchy levels",200],
        GET_HIERARCHY_LEVEL : [9017,"Successfully fetched hierarchy levels",200],
        GET_HIERARCHY_TREE : [9017,"Successfully fetched hierarchy Tree",200],

        ALL_REGISTERED_PLUGINS : [9018,"Successfully fetched all the registered plugins",200],
        REGISTERED_PLUGIN_BY_ID : [9019,"Successfully fetched registered plugins",200],
        DETECTING_PLUGINS : [9002,"Successfully fetched all detected plugins",200],

        PLUGIN_API_REHOST : [9023,"Successfully fetched data from the apllication",200],

        USER_LOGIN : [9021,"User successfully authenticated",200],
        DB_INFO : [9022,"Successfully fetched DB info",200],

    }, */



}