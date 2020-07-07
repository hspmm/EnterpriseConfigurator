module.exports = async function(sequelize, Sequelize) {
    const RegisteredApplications =await sequelize.define('RegisteredApplications', {
        ApplicationId: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate : {
                notEmpty : true
            }            
        },
        ApplicationName: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate : {
                notEmpty : true
            }  
        },
        ApplicationVersion: {
            type: Sequelize.STRING,
            allowNull: false,
            validate : {
                notEmpty : true
            }  
        },
        ApplicationGuid: {
            type: Sequelize.STRING,
            allowNull: false,
            validate : {
                notEmpty : true
            }  
        },
        ApplicationSecret: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate : {
                notEmpty : true
            }  
        },
    });
 
  /*   RegisteredApplications.beforeCreate(async (user, options) => {
        // const hashedPassword = await hashPassword(user.password);
        // user.password = hashedPassword;
        const salt = bcrypt.genSaltSync();
        RegisteredApplications.ApplicationSecret = bcrypt.hashSync(RegisteredApplications.ApplicationSecret, salt)
    }); */

    return RegisteredApplications;
 }