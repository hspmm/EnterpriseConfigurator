const dotenv = require('dotenv').config();

module.exports = {
    development: {
        username : process.env.DEV_DB_USERNAME,
        password : process.env.DEV_DB_PASSWORD,
        database : process.env.DEV_DB_DATABASE,
        url: process.env.DEV_APP_URL,
        port: process.env.PORT,
        server : process.env.DEV_DB_SERVER,
        description : process.env.DESCRIPTION,
        IsasLdapAuthentication : process.env.ISAS_LDAP_AUTH_TYPE,
        IsasStandaloneUserAuthentication : process.env.ISAS_STANDALONE_USER_AUTH_TYPE,
        IsasImprivataAuthentication : process.env.ISAS_IMPRIVATA_AUTH_TYPE,
        TREE_HIERARCHY_MAX_LEVELS: process.env.DEV_TREE_HIERARCHY_MAX_LEVELS,
        APP_NAME: process.env.APP_NAME,
        uniqueAppName : process.env.UNIQUE_APP_NAME,
        APP_VERSION: process.env.DEV_APP_VERSION,
        options:  {
            host: process.env.DEV_DB_HOST,
            dialect: process.env.DEV_DB,
            port : process.env.DEV_DB_PORT,
            logging: false,
            dialectOptions:{
                options: {
                    instanceName: process.env.DEV_DB_INSTANCE != '' ? process.env.DEV_DB_INSTANCE : '',
                    encrypt: true,
                }
            }
           
        }
    },
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_DATABASE,
        url:process.env.PROD_APP_URL,
        port: process.env.PORT,
        server : process.env.PROD_DB_SERVER,
        description : process.env.DESCRIPTION,
        IsasLdapAuthentication : process.env.ISAS_LDAP_AUTH_TYPE,
        IsasStandaloneUserAuthentication : process.env.ISAS_STANDALONE_USER_AUTH_TYPE,
        IsasImprivataAuthentication : process.env.ISAS_IMPRIVATA_AUTH_TYPE,
        TREE_HIERARCHY_MAX_LEVELS: process.env.PROD_TREE_HIERARCHY_MAX_LEVELS,
        APP_NAME: process.env.APP_NAME,
        uniqueAppName : process.env.UNIQUE_APP_NAME,
        APP_VERSION: process.env.PROD_APP_VERSION,
        options:  {
            host: process.env.PROD_DB_HOST,
            dialect: process.env.PROD_DB,
            port : process.env.PROD_DB_PORT,
            logging: false,
            dialectOptions:{
                options: {
                    instanceName: process.env.PROD_DB_INSTANCE ? process.env.PROD_DB_INSTANCE : '',
                    encrypt: true,
                }
              }
        }      

    }
};



/* const sql = require('mssql');


const config = {
    user: process.env.DB_USERNAME,    
    server: process.env.DB_SERVER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

exports.executeSql = function(sqlQuery, callback){
    console.log("Config:",config)
    var conection = new sql.ConnectionPool(config);
    conection.connect().then(function(){
        var req = new sql.Request(conection);
        req.query(sqlQuery).then(function(recordset){
            callback(recordset);
        }).catch(function(err){
            console.log("QUERY ERROR:",err);
            callback(null,err);
        })
    }).catch(function(err){
        console.log("connection error:",err);
        conection.close();
        callback(null,err)
    })
}


 */