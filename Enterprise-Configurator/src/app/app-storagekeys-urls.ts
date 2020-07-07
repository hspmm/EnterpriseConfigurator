// import { AppConfig } from './app.config'
// import { IAppConfig } from '../../src/app/interfaces/config';


export function AppLocalStorageKeys(){
  // var AppConfigFile = <IAppConfig>AppConfig.settings
    return{
      currentUser :"currentUserData",
      // stagingUrl: 'http://3.132.244.71:3000',
      // stagingUrl: 'http://10.74.56.227:3000',
      // baseUrl: AppConfig.settings['env']['baseUrl'],
      appDb:'EcDb',
      accessToken: 'accessToken',
      appType: 'enterprise-configurator',
      // authTypes : ["User","Imprivata", "LDAP"],
      urls:{ 
        // authTypes : '/api/v1/user/authtypes',       
        loginUrl: '/api/v1/user/login',
        logoutUrl: '/api/v1/user/logout',
        ecConfigUrl : '/api/v1/server/app/info',
        detectPluginsListUrl: '/api/v1/plugins/detect',
        setEnableAndDisablePluginServiceUrl: '/api/v1/plugins/services/activate',
        restartAllPluginServices : '/api/v1/plugins/services/restart/all',
        restartIndividualPluginServices : '/api/v1/plugins/services/restart/',
        heirarchyUrl: '/api/v1/hierarchy',
        addHeirarchyNodeUrl: '/api/v1/hierarchy/node/add',
        bulkCreateHeirarchyNodesUrl: '/api/v1/hierarchy/node/add/bulk',
        updateHierarchyNodeUrl: '/api/v1/hierarchy/node/update',
        deleteHierarchyNodeUrl: '/api/v1/hierarchy/node/delete/',
        hierarchyLevelUrl: '/api/v1/hierarchy/hierarchyLevel',
        importFacilities : '/api/v1/facilities/list/import',
        updateNodeParentId : '/api/v1/hierarchy/node/update/parentId',
        getLicensePluginUrl : '/api/v1/plugins/licensemanager/fetch',


        // saveToHeirarchyUrl: '/api/v1/hierarchy/addelement',
        // removeHeirarchyUrl: '/api/v1/hierarchy/removeelement',        
        // pluginsListUrl: '/api/v1/plugins',
        facilitiesListUrl: '/api/v1/facilities/list',
        updateFacilityUrl: '/api/v1/facilities/update',
        getAdditionalProperties: '/api/v1/additionalproperties/fetch',
        updateAddtnlProperty: '/api/v1/additionalproperties/update',
        // getAdditionalPropertiesMaster: '/api/v1/additionalproperties/update',
      },
      privileges : {
        addHierarchyTree : "canAddHierarchyTree",
        editHierarchyTree : "canEditHierarchyTree",
        deleteHierarchyTree : "canDeleteHierarchyTree",
        manageHierarchyLevels : "canManageHierarchyLevels",
        managePluginServices : "canManagePluginServices",
        manageSingleInstancePlugins : "canManageSingleInstancePlugins",
        manageDefaultPlugins : "canManageDefaultPlugins",
        manageFacilities : "canManageFacilities",
        canViewOnly : "canOnlyViewEnterprise"
      },      
      defaultHierarchyRootIcon : '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'
    }
  }
