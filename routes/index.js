var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport=require('passport');
var Formation=require('../models/formation');
var User=require('../models/user');
var Follow=require('../models/follow');
var Contact=require('../models/contact');
var Message=require('../models/message');
var Comment=require('../models/Comment');



router.post('/addFormation',function (req,res,next) {
    req.checkBody('formName',"Name of the formation can't be empty").notEmpty();
    req.checkBody('formDescription','Please write a description of the formation').notEmpty();
    req.checkBody('vId','Id of the video is required!').notEmpty();

    var errors=req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        req.flash('errorProfile', messages);
        return res.redirect('/profile');
    }

    var formation=new Formation();
    formation.former.id=req.user._id;
    formation.former.name=req.user.name.last+' '+req.user.name.first;
    formation.formName=req.body.formName;
    formation.formCategory=req.body.formCategory;
    formation.formDescription=req.body.formDescription;
    formation.importFrom=req.body.importFrom;
    formation.vId=req.body.vId;
    formation.save(function (err) {
        if(err){
            res.render('learn/profile', {errorMessages:'Sorry there was error while uploading your formation'});
        }
        var errorMessages='Your formation has been added successfully';
        res.redirect('/profile');

        //res.render('learn/profile',{errorMessages:'Your formation has been added successfully'});

    })
});
router.post('/updateFormation',function (req,res,next) {
    req.checkBody('formName',"Name of the formation can't be empty").notEmpty();
    req.checkBody('formDescription','Please write a description of the formation').notEmpty();
    req.checkBody('vId','Id of the video is required!').notEmpty();
    var errors=req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        req.flash('errorProfile', messages);
        return res.redirect('/profile');
    }
    var formationId=req.body.formationId;
    Formation.update({_id:formationId},{ $set: {
        formName:req.body.formName,
        formCategory:req.body.formCategory,
        importFrom:req.body.importFrom,
        formDescription:req.body.formDescription,
        vId:req.body.vId
    }}).exec();
    return res.redirect('/profile');

});
router.post('/deleteFormation',function (req,res,next) {
    var formationId=req.body.formationId;
    Formation.deleteOne({_id:formationId}).exec();
    Follow.deleteOne({'formation':formationId}).exec();
    return res.redirect('/profile');
})
router.post('/unfollowFormation',function (req,res,next) {
    var formationId=req.body.formationId;
    var user=req.user;
    Follow.deleteOne({'formation':formationId,'user':user}).exec();
    Formation.findOneAndUpdate({_id:formationId},{$inc : {'nbFollowers' : -1}}).exec();
    res.redirect('/following');
});
//Watch later
router.post('/watchLater',function (req,res,next) {
  //  console.log("coming from:"+req.url);
    console.log("watching post:")
    var formationId=req.body.formationId;
    var user=req.user;
    var messages=[];
    console.log("fId:"+formationId);
    if(user==null){
        messages.push(" Sorry you have to be logged In first, if you don't have an account yet create one bellow");
        console.log("user not there");
        req.flash('error', messages);
        return res.redirect('/');
    }
    else{
    Follow.findOne({'formation':formationId,'user':user._id},function (err,formation) {
        if(err){
            messages.push(err.msg);
            req.flash('error', messages);
        }
        if (formation){
            messages.push("You are already following that formation");
            return req.flash('error', messages);
            console.log('messages going: '+messages);
            console.log("already followed!");

        }

        Formation.findOneAndUpdate({_id:formationId},{$inc : {'nbFollowers' : 1}}).exec();

        var following =new Follow();
        following.user=user._id;
        following.formation=formationId;
        following.save(function (err) {
            if(err){
                console.log(err);
                return res.render('learn/index', {errorMessages:'Sorry there was error while saving the formation for later'});
                console.log("not followed!");

            }else {
                messages.push('The formation has been added to you profile');
                console.log('messages going: '+messages);
                return req.flash('error', messages);
                console.log('The formation has been added to you profile');
                return res.redirect('/following');
            }
        });

    })

    }
    if(req.session.oldUrl){
    var oldUrl=req.session.oldUrl;
    req.session.oldUrl=null;
      res.redirect(oldUrl);
    }else
    res.redirect('/');
});

router.post('/addComment' ,function (req,res,next) {

    var messages = [];
    var username;
    User.findOne({_id:req.user},function (err,user) {
        if(err) console.log("couldn't find user"+req.user);
        username=user.name.last+" "+user.name.first;
        var comment=new Comment();
        comment.formation=req.body.formationId;
        comment.details.content=req.body.comment;
        comment.details.user=req.user;
        comment.username=username;

        comment.save(function (err) {
            if(err) console.log("not saved!");
            messages.push("Your comment has been added!");
            req.flash('successComment', messages);
        });
    });

    if(req.session.oldUrl){
        var oldUrl=req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(oldUrl);
    }else
        res.redirect('learn/following');


});

var csurfProtection=csrf();
router.use(csurfProtection);

//Contact us
router.post('/contact',function (req,res,next) {
    var messages = [];
    req.checkBody('message',"Message can't be empty").notEmpty();
    var errors=req.validationErrors();
    if(errors) {
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/');
    }
    var contact=new Contact();
    if(req.user){
      contact.user=req.user;
    }
    contact.message=req.body.message;
    contact.save(function (err) {
        if (err) {
            messages.push(err.msg);
            res.redirect('/');
        }
        var sucessMessage = 'Your message has been sent successfully';
        messages.push(sucessMessage);
        req.flash('successContact', messages);
        if(req.session.oldUrl){
          var oldUrl=req.session.oldUrl;
          req.session.oldUrl=null;
          res.redirect(oldUrl);
        }else
         res.redirect('/');
    });



});

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.oldUrl=req.url;
    //var successFollow=req.flash('successFollow');
    var successContact=req.flash('successContact');
    var messages=req.flash('error');
    console.log('messages coming: '+messages);
    var nbMessages;
    Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        nbMessages=count>1?count:1;
    });
    var following;
    var nbStudents;
    var nbFormers;
    var nbFormations;
    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        following=count;
    });
    Formation.count(function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        nbFormations=count;
    });
    User.count({'type':'student'}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        nbStudents=count;
    });

    User.count({'type':'former'}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        nbFormers=count;
    });

   Formation.find({'formCategory':'computer sciences'},function (err,computer_science) {
        var computerFormations=computer_science.slice(0,4);

       Formation.find({'formCategory':'business'},function (err,business_formations) {
        var businessFormations=business_formations.slice(0,4);
        Formation.find({'formCategory':'health'},function (err,health_formations) {
            var health_formations=health_formations.slice(0,4);
            Formation.find({'formCategory':'cooking'},function (err,cooking_formations) {
                var cooking_formations=cooking_formations.slice(0,4);

                Formation.find({'formCategory':'sciences'},function (err,sciences_formations) {
                    var sciences_formations=sciences_formations.slice(0,4);


                    Formation.find({'formCategory':'math'},function (err,math_formations) {
                        var math_formations=math_formations.slice(0,4);

            console.log("messages going"+messages);
           res.render('learn/index', {
               title: 'E-Learning', csrfToken: req.csrfToken(),
               messages: messages, hasErrors: messages.length > 0, following: following,
               successContact: successContact, isSent: successContact.length,
               computerFormations: computerFormations,
               mathFormations: math_formations,
               sciencesFormations: sciences_formations,
               cookingFormations: cooking_formations,
               healthFormations: health_formations,
               businessFormations: businessFormations,
               nbStudents: nbStudents, nbFormers: nbFormers, nbFormations: nbFormations,
               nbMessages: nbMessages,
           });
           });
           });
        });
        });
       });
   });
});

router.get('/watching',isLoggedIn,function (req,res,next) {
    req.session.oldUrl=req.url;
    var nbMessages;
    Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        nbMessages=count>1?count:1;
    });
    var following;
    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        following=count;
    });
    var successComment=req.flash('successComment');
    var formationId=req.query.formation;
    Formation.findOne({_id:formationId},function (err,formation) {
        if(err) console.log("couldn't find form "+formationId);
            console.log("formation: " +formation);

            Comment.find({'formation':formationId},function (err,comments) {

                if(err) console.log("couldn't find comment "+formationId);

                res.render('learn/watching',{csrfToken: req.csrfToken(),
                    formation:formation,
                    comments:comments,
                    nbComments:comments.length,
                    formationId:formationId,
                    successComment:successComment,
                    isAdded:successComment.length,
                    following:following,
                    nbMessages:nbMessages
                });
            });
        });



});

router.get('/formations',function (req,res,next) {
    req.session.oldUrl=req.url;
    var nbMessages;
    Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        nbMessages=count>1?count:1;
    });
    var successContact=req.flash('successContact');
    var messages=req.flash('error');
    var following;
    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        following=count;
    });
    var formationsCat=req.query.cat;
    console.log(req.params);
    console.log("Category "+formationsCat);
    Formation.find({'formCategory':formationsCat},function (err, formations) {
        if (err){
            messages.push('Error looking for formations')
            console.log(err);
        }
        console.log(formations);
        res.render('learn/formations',{formations:formations,
            cat:formationsCat.charAt(0).toUpperCase() + formationsCat.slice(1),
        count:formations.length,following:following,
        csrfToken: req.csrfToken(),
         messages:messages,hasErrors:messages.length>0,following:following,
         successContact:successContact,isSent:successContact.length>0,
            nbMessages:nbMessages,
       hasMessages:(messages.length>0)?(messages.length>0):successContact.length});

    });
})

router.get('/discussion',isLoggedIn,function (req,res,next) {
    req.session.oldUrl=req.url;
    var following;
    var successContact=req.flash('successContact');

    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count:0;
        following=count;

        console.log('from discussion following '+following);
        res.render('learn/discussion',{csrfToken: req.csrfToken(),
            following:following,
            successContact:successContact,isSent:successContact.length>0
        });
    });
});

router.post('/signup',passport.authenticate('local.signup',{
    successRedirect:'/profile',
    failureRedirect:'/',
    failureFlash:true
    })
);
router.post('/signin',passport.authenticate('local.signin',{
        successRedirect:'/profile',
        failureRedirect:'/',
        failureFlash:true
    })
);

router.get('/profile',isLoggedIn,function (req,res,next) {
        req.session.oldUrl=req.url;

        var following;
        var nbMessages;
        Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
         nbMessages=count>1?count:1;
         });
        var successContact=req.flash('successContact');

        var relatedCat='computer sciences';
        Follow.count({'user':req.user}, function (err, count) {
            if(err){
                console.log(err);
            }
            var count=count>0 ? count:0;
            following=count;
        });
        if(following>0){
            Follow.findOne({'user':req.user},function (err,relatedFormation) {
                Formation.findOne({_id:relatedFormation.formation},function (err,relatedCategory) {
                    relatedCat=relatedCategory.formCategory? relatedCategory.formCategory:'computer sciences';
                    Formation.find({'formCategory':relatedCat},function (err,relatedFormations) {
                        var errorAddingFormation=req.query.errorAddingFormation;
                        var messages=req.flash('errorProfile');

                        Formation.find({ 'former.id':req.user._id }, function (err, formation) {
                            if (err){
                                messages.push('Error looking for formations')
                                console.log(err);
                            }
                            var formations=formation;
                            res.render('learn/profile',{csrfToken: req.csrfToken(),
                                messages:messages,hasErrors:messages.length>0,following:following,
                                successContact:successContact,isSent:successContact.length>0,
                                formations:formations,hasFormations:formations.length,
                                relatedFormations:relatedFormations,relatedCat:relatedCat,
                                nbMessages:nbMessages
                            });
                        })
                    })
                })
            })

        }else {
            Formation.find({'formCategory':relatedCat},function (err,relatedFormations) {
                var errorAddingFormation=req.query.errorAddingFormation;
                var messages=req.flash('errorProfile');

                Formation.find({ 'former.id':req.user._id }, function (err, formation) {
                    if (err){
                        messages.push('Error looking for formations')
                        console.log(err);
                    }
                    var formations=formation;
                    res.render('learn/profile',{csrfToken: req.csrfToken(),
                        messages:messages,hasErrors:messages.length>0,following:following,
                        successContact:successContact,isSent:successContact.length>0,
                        formations:formations,hasFormations:formations.length,
                        relatedFormations:relatedFormations.slice(0,6),relatedCat:relatedCat,
                        nbMessages:nbMessages
                    });
                })
            })
        }

});
router.get('/messages',isLoggedIn,function (req,res,next) {
    req.session.oldUrl=req.url;
    var nbMessages;
    var successContact=req.flash('successContact');
    Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        nbMessages=count>1?count:1;
    });
    var following;
    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        var count=count>0 ? count: '';
        following=count;
    });
    Message.find({'to':req.user},function (err,messages) {
       res.render('learn/messages',{messages:messages,nbMessages:messages.length,
           csrfToken: req.csrfToken(),
           successContact:successContact,isSent:successContact.length>0,
           nbMessages:nbMessages,following:following});
    });
});
router.get('/following',isLoggedIn,isFollowing,function (req,res,next) {
  req.session.oldUrl=req.url;
    var nbMessages;
    var successContact=req.flash('successContact');
    Message.count({'to':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
        nbMessages=count>1?count:1;
    });
    Follow.find({'user':req.user},function (err,following) {
        var done=0;
        var followingCourses=[];
        for(var i=0;i<following.length;i++){
            Formation.findOne({'_id':following[i].formation},function (err,formation) {
                if(err){
                    messages.push('Error looking for formations')
                    console.log(err);
                }
                followingCourses.push(formation);
                done++;

                if(done===following.length){
                    render();
                }
            });
        }
        if(err){
            messages.push("Error looking for the courses you're following");
            console.log(err);
        }
        function render() {

            res.render('learn/following',{
                followingCourses:followingCourses,following:following.length,
                nbMessages:nbMessages,
                csrfToken: req.csrfToken(),
                successContact:successContact,isSent:successContact.length>0,

            });
        }

    })
})
router.get('/logout',function (req,res,next) {
    req.logout();
    res.redirect('/');

})
module.exports = router;
function isFollowing(req,res,next) {
    var following;
    Follow.count({'user':req.user}, function (err, count) {
        if(err){
            console.log(err);
        }
         following=count>0 ? count:0;
        //following=count;

        if(following>0){
            return next();
        }else
            res.redirect('/');
    });
}
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');

}

function notLoggedIn(req,res,next) {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');

}
