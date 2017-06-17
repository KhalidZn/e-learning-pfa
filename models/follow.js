/**
 * Created by khalidzn on 22/05/17.
 */



var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var followSchema=new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    formation:{type:Schema.Types.ObjectId,ref:'Formation'},
    dateFollow: { type: Date, default: Date.now },
});
module.exports=mongoose.model('Follow',followSchema);