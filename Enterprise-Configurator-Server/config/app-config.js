var env = process.env.NODE_ENV || 'development';
var config = require('./db.config')[env];

const appInfo = {
    name: config.APP_NAME,
    uniqueName : config.uniqueAppName,
    version : config.APP_VERSION,
    description : config.description,
    baseUrl : config.url,
    serverPort : config.port,
    maxHierarchyLevels : config.TREE_HIERARCHY_MAX_LEVELS,
    securityApp : process.env.PRIMARY_SECURITY_APP_NAME,
    licenseManagerApp : process.env.PRIMARY_LICENSE_MANAGER_APP_NAME,
    notificationManagerApp : process.env.PRIMARY_NOTIFICATION_MANAGER_APP_NAME,
    appNotificationAlerts : {
        authenticationAlerts : {
            name: 'Authentication Alerts',
            key : 'Authentication_Alerts',
            priority : 'high'
        }
    },
    sessionSecret : 'Enterprise_Configurator',
    sessionMaxAge : 60000, // 5 minutes
    EcUrls : {
        getPluginConfigDetailsAPI : process.env.GET_PLUGIN_CONFIG_DETAILS_API
    },
    isServicesEnabled : true,
    isISASEnabled : true,
    privileges : [
        {
            name : "May add enterprise hierarchy tree",
            key : "canAddHierarchyTree"
        },
        {
            name : "May delete enterprise hierarchy tree",
            key : "canDeleteHierarchyTree"
        },
        {
            name : "May edit enterprise hierarchy tree",
            key : "canEditHierarchyTree"
        },
        {
            name : "May manage enterprise hierarchy levels",
            key : "canManageHierarchyLevels"
        },
        {
            name : "May manage enterprise plugins services",
            key : "canManagePluginServices"
        },
        {
            name : "May manage enterprise single instance plugins",
            key : "canManageSingleInstancePlugins"
        },
        {
            name : "May manage enterprise default plugins",
            key : "canManageDefaultPlugins"
        },
        {
            name : "May view enterprise configurator",
            key : "canOnlyViewEnterprise"
        },
        {
            name : "May manage enterprise facilities",
            key : "canManageFacilities"
        }
    ]
}

module.exports = appInfo



