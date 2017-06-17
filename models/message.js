/**
 * Created by khalidzn on 06/06/17.
 */

var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var messageSchema=new Schema({
    from: {type:String,required:true},
    to:{type:Schema.Types.ObjectId,ref:'User'},
    object:{type:String,required:true},
    content:{type:String,required:true},
    dateSent: { type: Date, default: Date.now },
});
module.exports=mongoose.model('Message',messageSchema);