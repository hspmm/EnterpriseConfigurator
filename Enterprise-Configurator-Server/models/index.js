const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var basename = path.basename(__filename);
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/db.config.js')[env];
var session = require('express-session');
// initalize sequelize with session store
var SequelizeStore = require('connect-session-sequelize')(session.Store);


console.log("####### DB INFO:",config.options)

let db = {};
let sequelize = new Sequelize(config.database, config.username, config.password, config.options);



fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(async file => {
    var model = await sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {    
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});



/*********** BEGIN OF SESSION TABLE AND SYNCING LOGIC ***********/


function extendDefaultFields(defaults, session) {
  console.log("@@@@@@@@@@#############:SESSION:",defaults) 
  return {
    data: session.data,
    tokenTimeOutInterval : session.tokenTimeOutInterval,
    expires: session.expires,
    userName: session.userName,
    accessToken : session.accessToken,
    refreshToken : session.refreshToken,
    privileges : session.privileges,
    tokenRefreshedAt : new Date(Date.now()),
  };
}

var mySessionStore = new SequelizeStore({
  db: sequelize,
  table: 'Sessions',
  disableTouch : false,
  extendDefaultFields: extendDefaultFields,
  checkExpirationInterval: 60000, // The interval at which to cleanup expired sessions in milliseconds.
  // expiration: session.expires // The maximum age (in milliseconds) of a valid session.
})

// mySessionStore.sync()
/*********** END OF SESSION TABLE AND SYNCING LOGIC ***********/




/* sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    }) */

/* fs
    .readdirSync(__dirname)
    .filter(file => (file.indexOf(".") !== 0) && (file !== basename))
    .forEach(async file => {
        let model = await sequelize.import(path.join(__dirname, file));
        console.log("###model:", model.name)
        db[model.name] = model;
        console.log("###db:")


    }); */

/*     
Object.keys(db).forEach(modelName => {
        console.log("###db####:", "associate" in db[modelName])
        if ("associate" in db[modelName]) {
            db[modelName].associate(db);
        }
}); */


db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.mySessionStore = mySessionStore;
/* db.sequelize.sync({alter : true}).then(()=>{
  console.log("@@######Database synced")
}).catch(e =>{
  console.log("####Error while DB synching :",e)
}) */
module.exports = db;
