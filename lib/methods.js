Meteor.methods({
  getCollections:function(f,userString){
    var names=userString.split(',');
    for(var i in names){
      var name=names[i].trim();
      if(!isEmpty(name)){
        Meteor.call(f,name);
      }
    }
  },
  bgg:function(userId){
    if(Meteor.isServer){
      HTTP.get('http://boardgamegeek.com/xmlapi2/collection',{params:{username:userId,own:1}},function(err,res){
        if(!err) {
          // console.log("****"+res.statusCode);
          if(res.statusCode===202){
            Meteor.setTimeout(function(){Meteor.call('bgg',userId);},3000);
            return;
          }
          else{
            //console.log(res.content);
            var resXml=res.content;
            xml2js.parseString(resXml,function(err,res){
              if(!err && !res.hasOwnProperty('errors')){
                //console.log(res);
                var games=res.items.item;
                GamesDB.remove({user:userId});
                console.log('inserting in gamesdb');
                games.forEach(function(i){
                  GamesDB.insert({user:userId,game:i.name[0]._});
                })
               
              }
              else {
                console.log("!!"+err);
                GamesDB.insert({user:userId,badId:true});
              }
            });
          }
        }
        else console.log("$$$$$"+err);
      });
    }
  },
  bggtemp:function(userId,n){
    var times=n||Math.floor(Math.random()*2)+1;
    for(var t=0;t<times;t++){
    GamesDB.insert({user:userId,game:Math.floor(Math.random()*10)});
    }
  },
  mergeTables:function(){
    if(Meteor.isClient){
      console.log('FIRE');
      GamesProcessedDB.remove({});
      var sortedGameObj = GamesDB.find({},{fields:{game:1},sort:{game:1}});
      var gameSet = removeDups(sortedGameObj.map(function(x){return (x.game);}));
      //gameSet.forEach(function(gameName) {
      for(var t=0;t<gameSet.length;t++){
        //console.log(t+":"+gameSet[t]);
        /*if(t===0) { 
          console.log('false');
          Session.set('activesync',false);
        }
        else if(t===gameSet.length-1){
          console.log('true');
          Session.set('activesync',true);
        }*/
        var gameName = gameSet[t];
        var usersObj = GamesDB.find({game:gameName},{fields:{user:1},sort:{user:1}});
        var users = usersObj.map(function(x){return (x.user);});
        var userString = users.reduce(function(pv,cv){return pv.concat(",").concat(cv);}, "").substring(1);
        GamesProcessedDB.insert({game:gameName,user:userString});
        }
    }
  }
});

function removeDups(arr){
	var newArray = [];
	arr.forEach(function(x) {
    if (newArray.length===0 || newArray.slice(-1)[0]!==x)
        newArray.push(x);
	});
	return newArray;
}

function isEmpty(str){
  return (!str||0===str.length);
}