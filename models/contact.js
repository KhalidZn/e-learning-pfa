/**
 * Created by khalidzn on 23/05/17.
 */



var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var contactSchema=new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    message:{type:String,required:true},
    dateSent: { type: Date, default: Date.now },
});
module.exports=mongoose.model('Contact',contactSchema);
