// var commonUtils = require('../utils/common.utils')
const uuidv1 = require('uuid/v1');

module.exports = async function(sequelize, Sequelize) {
    const Facilities = await sequelize.define('Facilities', {
        Uid : {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuidv1(),
            primaryKey: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate : {
                notEmpty :{
                    args : true,
                    msg : "Node name shoudn't have to be empty"
                }
            }
        },
        AddressLine1: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        AddressLine2: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        AddressLine3: {
            type: Sequelize.TEXT,
            allowNull: true
        },
       /*  FullAddress : {
            type: DataTypes.VIRTUAL,
            get() {
                return this.AddressLine1 + this.AddressLine2 + this.AddressLine3
            },
            set(value) {
                throw new Error('Do not try to set the `FullAddress` value!');
            }
        }, */
        City: {
            type: Sequelize.STRING,
            allowNull: false
        },
        State: {
            type: Sequelize.STRING,
            allowNull: true
        },
        PostalCode: {
            type: Sequelize.STRING,
            allowNull: true
        },
        Country: {
            type: Sequelize.STRING,
            allowNull: false
        },
        IPRange: {
            allowNull: true,
            type: Sequelize.STRING,
        },
        Status: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        Contact: {
            type: Sequelize.STRING,
            allowNull: true
        },
        Email: {
            type: Sequelize.STRING,
            allowNull: true,
            validate:{
                isEmail : {
                    args : true,
                    msg : "Not a valid email format"
                }
            }
        },
        Department: {
            type: Sequelize.STRING,
            allowNull: true
        },
        Phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: () => true,
            allowNull: false
        }
    });


    return Facilities;
 }
