
module.exports = async function(sequelize, Sequelize) {
    const Plugins_Details = await sequelize.define('Plugins_Details', {
        Id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        Uid: {
            type: Sequelize.STRING,
            allowNull : false
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        UniqueName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        Version: {
            type: Sequelize.STRING,
            allowNull: false
        },
        Description: {
            type: Sequelize.STRING
        },
        UiPort: {
            type: Sequelize.STRING,
            allowNull: false
        },
        BaseUrl: {
            type: Sequelize.STRING,
            allowNull: false
        },
        Type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        Instances: {
            type: Sequelize.STRING
        },
        ServerPort: {
            type: Sequelize.STRING,
            allowNull: false
        },
        PrependUrl: {
            type: Sequelize.STRING,
            allowNull: false
        },
        IconUrl : {
            type: Sequelize.TEXT,
            allowNull: true
        },
        UiUrls: {
            type: Sequelize.TEXT
        },
        ServerUrls: {
            type: Sequelize.TEXT
        },
        IsRegistered: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        ServicesEnabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        IsLicenced: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
    },{
        /* hooks:{
            beforeUpdate : (Plugins_Details)=> {
                console.log("++++**************---->BEFORE Update:",Plugins_Details.UiUrls)
                Plugins_Details.UiUrls = JSON.stringify(Plugins_Details.UiUrls)
            },
            beforeCreate : ()=> {
                console.log("++++**************---->BEFORE CREATE:")
            }
        } */
    });
 
    return Plugins_Details;    
 }
