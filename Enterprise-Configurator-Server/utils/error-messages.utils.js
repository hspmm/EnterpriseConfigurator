/* 
errordescription

{
    ERROR_ADDELEMENT: 'failed to add element '
    ERROR_REMOVEELEMENT: 'failed to remove element '


}
errorstausCode
{

    ERROR_ADDELEMENT: 200
    ERROR_REMOVEELEMENT:200
    
}

module.exports = {
    ERRORS : {
        HIERARCHY : {
            ERROR_ADDELEMENT : 1000 
        }
    },

    ERROR : {
        HIERARCHY : {
            ADDELEMENT : function(req,res,next){
                next({status : 1000 , message: "No Registered Plugins found in Database"})
            }
        },
        LOCAL_PLUGINS : {
            REGISTERED_PLUGIN_LIST : function(req,res,err,next){
                next({status : 1000 , message: err})
            }
        }
    },

    SUCCESS : {
        HIERARCHY : {
            ADDELEMENT : function (req,res,result,next){
                next(result)
            }
        }
    }
} */