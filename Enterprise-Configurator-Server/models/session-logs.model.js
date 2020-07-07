
module.exports = async function(sequelize, Sequelize) {
    const Session_Logs =await sequelize.define('Session_Logs', {
        sid: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: false
        },
          expires: {
            type: Sequelize.DATE,
            allowNull: false
        },
 /*          data: {
            type: Sequelize.TEXT,
            allowNull: false
        } */
    });
 
    return Session_Logs;
}