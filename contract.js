'use strict';

var Comments = function (author,content,star) {
    this.author = author;
    this.star = star;
    this.content = content;
};

Comments.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};


var Restaurant = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.name = o.name;
    this.comments = o.comments;
  }else{
    this.name = '';
    this.comments = [];
  }
};

Restaurant.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};


var RestCommentContract = function () {
  LocalContractStorage.defineMapProperty(this, "data", {
    parse: function (text) {
      return new Restaurant(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
   LocalContractStorage.defineMapProperty(this, "arrayMap");
};

RestCommentContract.prototype = {
  init: function () {
    this.size = 0;
  },

  comment: function (restaurant,content,star) {
    var from = Blockchain.transaction.from;

    var new_res = new Restaurant();
    var restaurant_data = this.data.get(retaurant);
    if (restaurant_data) {
        new_res = restaurant_data;
    }else{
      this.arrayMap.set(this.size, retaurant));
      this.size +=1 ;
    }
    new_res.name = restaurant;
    new_res.comments.push(new Comments(from,content,star));
    this.data.put(restaurant, deposit);
  },

  len:function(){
    return this.size;
  },

  read:function(restaurant){
      if(!restaurant){
        throw new Error('empty restaurant');
      }
      return this.data.get(restaurant);
  },

  readall: function () {
        var result  = {}
        for(var i=0;i<this.size;i++){
            var key = this.arrayMap.get(i);
            var object = this.data.get(key);
            result[key] = object;
        }
        return result;
  }
};
module.exports = RestCommentContract;
