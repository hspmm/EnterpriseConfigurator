/* module.exports = async function(sequelize, Sequelize) {
    const HeirarchyLevel =await sequelize.define('New_Hierarchy_levels', {
        Id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        Name: {
            type: Sequelize.STRING,
            unique: "level_name_id",
            allowNull: false
        },
        LevelType : {
            type : Sequelize.STRING,
            allowNull : false
        },
        Image: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        IsActive: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    });
 
    return HeirarchyLevel;
 }
 */

 module.exports = async function(sequelize, Sequelize) {
    const HierarchyLevel =await sequelize.define('Very_New_Hierarchy_levels', {
        Id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        LevelData : {
            type : Sequelize.TEXT,
            allowNull : false
        }
    });
 
    return HierarchyLevel;
}