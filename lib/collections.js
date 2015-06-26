GamesDB = new Mongo.Collection('games');
GamesProcessedDB = new Mongo.Collection('m',{connection:null});  
GamesProcessedDB.allow({
  insert:function(){return true;},
  update:function(){return true;},
  remove:function(){return true;}
});