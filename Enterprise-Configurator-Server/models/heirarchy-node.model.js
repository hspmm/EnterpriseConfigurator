var commonUtils = require('../utils/common.utils')
const uuidv1 = require('uuid/v1');

module.exports = async function(sequelize, Sequelize) {
    const Node =await sequelize.define('Nodes', {

        Uid : {
            allowNull: false,
            type: Sequelize.UUID,
            defaultValue: () => uuidv1(),
            validate : {
                notNull : {
                    args : true,
                    msg : "Uid shoudn't have to be empty"
                },
                notEmpty :{
                    args : true,
                    msg : "Uid shoudn't have to be empty"
                }
            }
        },
        NodeID: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        NodeName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate : {
                notNull : {
                    args : true,
                    msg : "Node name shoudn't have to be empty"
                },
                notEmpty :{
                    args : true,
                    msg : "Node name shoudn't have to be empty"
                }
            }
        },
        NodeShortName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ParentID: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        NodeType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        TypeOf: {
            type: Sequelize.STRING,
            allowNull: false
        },
        PluginID: {
            type: Sequelize.UUID,
            allowNull: true
        },
        NodeInfo: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        /* AdditionalProperties: {
            type: Sequelize.INTEGER,
            allowNull: true
        }, */
   /*      CreatedDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        LastModifiedDate: {
            type: Sequelize.DATE,
            allowNull: false
        }, */
        CreatedBy: {
            type: Sequelize.STRING,
            allowNull: false
        },
        PluginInfoId: {
            allowNull: true,
            type: Sequelize.UUID,
        },
        ModifiedBy: {
            type: Sequelize.STRING,
            allowNull: false
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
    },{
        /* hooks:{
            beforeCreate: async function(model, options, cb) {
                console.log("BEFORE CREATE:",model)
                commonUtils.assignAutoIncrementNumber(model.Id,(err,Id)=>{
                    if(Id){
                        model.Id = Id
                    }
                })
            }
        } */
    });


    return Node;
 }

 async function getUid(node){
    console.log("nodeeeeee:",node)
    return true
 }
