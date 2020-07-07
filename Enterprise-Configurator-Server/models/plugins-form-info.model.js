const uuidv1 = require('uuid/v1');

module.exports = async function(sequelize, Sequelize) {
    const PluginsFormInfo =await sequelize.define('PluginsFormInfo', {
        FormId: {
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            type: Sequelize.INTEGER,
            validate : {
                notEmpty : {
                    args : true,
                    msg : "Form Id shouldn't have to be empty"
                }
            }            
        },
        Id : {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuidv1()
        },
        FormInfo: {
            type: Sequelize.TEXT,
            allowNull: true,  
        }
    });
 
    return PluginsFormInfo;
 }