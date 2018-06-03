'use strict';

var Comments = function (author, content, star) {
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
    this.total_score = o.star;
    this.comments = o.comments;
  } else {
    this.name = '';
    this.comments = [];
    this.total_score = 0;
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
  LocalContractStorage.defineProperty(this, "size");
};

RestCommentContract.prototype = {
  init: function () {
    this.size = 0;
  },

  comment: function (res_name, content, star) {
    if (star > 5 || star < 0) {
      throw new Error('invalid params');
    }
    var from = Blockchain.transaction.from;

    var new_res = new Restaurant();
    var restaurant_data = this.data.get(res_name);
    if (restaurant_data) {
      new_res = restaurant_data;
    } else {
      this.arrayMap.set(this.size, res_name);
      this.size = this.size + 1;
    }
    new_res.name = res_name;
    new_res.comments.push(new Comments(from, content, star));
    new_res.total_score = new_res.total_score + star;
    this.data.put(res_name, new_res);
    return {
      "code": 0
    }
  },

  len: function () {
    return {
      "size": this.size
    };
  },

  read: function (res_name) {
    if (!res_name) {
      throw new Error('empty restaurant');
    }
    if (!this.data.get(res_name)) {
      return rlt  
    }
    return this.data.get(res_name);
  },

  readscore: function (res_name) {
    if (!res_name) {
      throw new Error('empty restaurant');
    }
    var restaurant_data = this.data.get(res_name);
    if (!restaurant_data) {
      rlt = this._search(res_name)
      if (!rlt) {
        return {}
      }
      restaurant_data = rlt
    }
    if (restaurant_data.comments.length == 0) {
      return {
        "name": restaurant_data.name,
        "avg_sorce": 0
      };
    }
    var avg_score = restaurant_data.total_score / restaurant_data.comments.length
    return {
      "name": restaurant_data.name,
      "avg_sorce": avg_score
    };
  },

  readall: function () {
    var result = {}
    for (var i = 0; i < this.size; i++) {
      var key = this.arrayMap.get(i);
      var object = this.data.get(key);
      result[key] = object;
    }
    return result
  },

  _search: function (res_name) {
    rlt = {}
    for (let [key, value] of this.data) {
      if (key.includes(res_name)) {
        rlt = value
        break
      }
    }
    return rlt
  }
};
module.exports = RestCommentContract;
