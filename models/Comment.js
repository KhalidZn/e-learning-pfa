/**
 * Created by khalidzn on 08/06/17.
 */


var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var commentSchema=new Schema({
    details:{
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        content:{type:String,required:true},
    },
    username:{type:String,required:true},
    formation:{type:Schema.Types.ObjectId,ref:'Formation'},
    dateComment: { type: Date, default: Date.now },
    likes: { type: Number, default:0 }
});
module.exports=mongoose.model('Comment',commentSchema);