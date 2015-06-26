ServiceConfiguration.configurations.upsert(
  { service: "google" },
  { $set: 
   { clientId: "1061484596683-tv2v9n7cncneg1bpp608p5aairrn79rs.apps.googleusercontent.com", secret: "hcQVefY_OhpRbaqbDIsKvdm9" } 
  }
);

var Queue = function(callback){
    this.timeoutHandle = null;
    this.callback = callback;
    this.q = [];
}

Queue.prototype = {
    add: function(record){
        var self = this;
        self.q.push(record)
        
        if(self.timeoutHandle){
            clearTimeout(self.timeoutHandle)
        }
        
        self.timeoutHandle = setTimeout(function(){
            self.run()
        }, 350);
    },
    run: function() {
        var self = this;
        _.each(self.q, function(record){
            self.callback(record);
        });
        self.q = [];
    }
};

var collectionQueue = new Queue(function(record){
    console.log("out:", record);
});

for(var i = 0; i < 1000; i++){
    collectionQueue.add(i);
    console.log("in:", i);
}