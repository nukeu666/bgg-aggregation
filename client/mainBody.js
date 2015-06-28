Session.set('members',[]);
subs=new ReactiveDictx();//[];
var resetSyncing = false;
//http://stackoverflow.com/questions/12298640/meteors-subscription-and-sync-are-slow
//https://registry.hub.docker.com/u/meteorhacks/meteord/
//http://themeteorchef.com/recipes/writing-a-package/
function existsInArray(arr,path,ele) {
  for(var i=0;i<arr.length;i++) {
    if(arr[i][path]===ele) {
      return false;
    }
  }
  return true;
}
function createFunc(name){
  return function(){
   // Meteor.call('mergeTables');
    var badId=false;
    var userSaved = Session.get('members');
    if(existsInArray(userSaved,'member',name)) {
      if(GamesDB.findOne({badId:true,user:name})) {/////FIX SYNC
        badId=true;
      }
      userSaved.push({member:name,badId:badId});
      Session.set('members',userSaved);
    }
  };
}
function push(nameStr){////update
  var names=nameStr.split(',');
  for(var i in names){
    var name=names[i].trim();
    if(!isEmpty(name)){
      //console.log('subs:'+name);
      var sub=Meteor.subscribe('games',name,createFunc(name));
      //console.log(sub);
      subs.set(name,sub);
    }
  }
}
Template.mainBody.events({
  'click #getIt, keydown input':function(e){
    if(e.which===13 || e.which===1){
      $('.init-fields').hide();
      $('.init-hide').show();
      var names=$('#nameList').val();//.split(',');
      //for(var i in names) {
     //   if(names[i].trim().length>0){
          Meteor.call('getCollections','bgg',names,push(names));
    //    }
    //  }
    }
  },
  'click #reset':function(){
    $('#nameList').val('');
    $('.init-fields').show();
    $('.init-hide').hide();
    Session.set('members',[]);
    Object.keys(subs.keys).forEach(function(name){
      console.log(subs.get(name));
      subs.get(name).stop();
      subs.set(name,undefined);
    });
   // GamesProcessedDB.remove({});//<<
  },
  'click #save':function(){
    
  }
});

Template.mainBody.helpers({
  selector:function(){
    return GamesDB.find({badId:{$not:true}});
  },
  syncing:function(){
    return Session.get('syncing')||false;
  },
  reactiveFunc:function(){
    return GamesProcessedDB.find({});
  },
  settings:function(){
    return{
      fields:[
        {key:'game',label:'Game'},
        {key:'user',label:'Who has it?'}
      ]
    }
  }
});

Template.mainBody.onRendered(function(){
  if(Meteor.Device.isPhone()){
    var template=this;
    var slideout=new Slideout({
      panel:template.$('#panel').get(0),
      menu:template.$('#menu').get(0),
      padding:256,
      tolerance:70
    });
  } 
});

Template.gamesList.helpers({
  game:function(){
    var sortedGameObj = GamesDB.find({},{fields:{game:1},sort:{game:1}});
    var gameSet = new Set(sortedGameObj.map(function(x){return (x.game);}));
    var table = [];
    gameSet.forEach(function(gameName) {
      var usersObj = GamesDB.find({game:gameName},{fields:{user:1},sort:{user:1}});
      var users = usersObj.map(function(x){return (x.user);});
      var userString = users.reduce(function(pv,cv){return pv.concat(",").concat(cv);},"").substring(1);
      table.push({gameName:gameName,user:userString});
    });
    return table;
   }
});

Template.userList.helpers({
  members:function(){
    return Session.get('members');
   }
 });
Template.userList.events({
  'click button':function(e){
    var $button = $(e.target);
    var name=$button.text();
    console.log($button.text());
    if($button.hasClass('btn-success')) {
      console.log(subs.get(name));
      subs.get(name).stop();
      subs.set(name,undefined);
    }
    else {
      subs.set(name,Meteor.subscribe('games',name));
    }
    $button.toggleClass('btn-warning btn-success');
  }
});

function isEmpty(str){
  return (!str||0===str.length);
}


Tracker.autorun(function(){
  var userMap = new Map();
  Session.set('syncing',true);
  console.log('syncing on');
  var x=subs.all();
  if(resetSyncing) Meteor.clearTimeout(resetSyncing);
  resetSyncing=Meteor.setTimeout(function(){
    GamesProcessedDB.remove({});
    console.log('rem');
    var sortedGameObj = GamesDB.find();
    console.log('sync off');
    Session.set('syncing',false);
    sortedGameObj.forEach(function(e){
      //console.log(e.game);
      if(userMap.has(e.game)){
        var t = userMap.get(e.game).user;
        userMap.set(e.game,{user:e.user+','+t});  
      } else {
        userMap.set(e.game,{user:e.user});
      }
    });
    userMap.forEach(function(v,k,m){
      GamesProcessedDB.insert({game:k,user:v.user});
    });
  },500);
});