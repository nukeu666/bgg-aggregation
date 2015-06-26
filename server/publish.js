Meteor.publish('games',function(user){
  return GamesDB.find({user:user});
});

//Kadira.connect('Md8ZpAQtTquWLZein', '07d37bc3-7699-4187-8032-bc4c8ce23669');