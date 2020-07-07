module.exports = async function(sequelize, Sequelize) {
    const Session =await sequelize.define('Sessions', {
        sid: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          userName: Sequelize.STRING,
          accessToken: Sequelize.TEXT,
          refreshToken: Sequelize.TEXT,
          privileges: Sequelize.TEXT,
          expires: Sequelize.DATE,
          data: Sequelize.TEXT,
          tokenTimeOutInterval: Sequelize.TEXT,
          tokenRefreshedAt : Sequelize.DATE
    });
 
    return Session;
}