/**
 * Created by khalidzn on 17/05/17.
 */


var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var formationSchema=new Schema({
    former: {
        id: {type: Schema.Types.ObjectId, ref: 'User'},
        name:{type:String}
    },
    nbFollowers:{type:Number,default:0},

    formName:{type:String,required:true},

    dateAdded: { type: Date, default: Date.now },

    formCategory:{type:String,required:true},

    formDescription:{type:String,required:true},

    importFrom:{type:String,required:true},

    vId:{type:String,required:true}
});

module.exports=mongoose.model('Formation',formationSchema);