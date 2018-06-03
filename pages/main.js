(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(156,217,249,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(156,217,249,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }




    var dappContactAddress = "";
    var nebulas = require("nebulas");
    var Account = require("nebulas").Account;
    var NebPay = require("nebpay");
    var nebPay = new NebPay();
    var neb = new nebulas.Neb();
    var account = Account;
    neb.setRequest(new nebulas.HttpRequest(""));


    var result_json = []; 
    // nep.api.call().then(function(resp){
    //     result_json
    // })
    var fakeJson = [
        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:2,"content":"好吃"}
            ]
          }
        },

        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:5,"content":"好吃"}
            ]
          }
        },
        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:3,content:"好吃"}
            ]
          }
        },
                {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:5,"content":"好吃"}
            ]
          }
        },

        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:4,"content":"好吃"}
            ]
          }
        },
        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:3,content:"好吃"}
            ]
          }
        }
        ,
        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:5,content:"好吃"}
            ]
          }
        }
        ,
        {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:2,content:"好吃"}
            ]
          }
        },
               {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:4,content:"好吃"}
            ]
          }
        },
               {
          result:
          {
            name:"大董",
            comments:[
              {author:"n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH",star:1,content:"好吃"}
            ]
          }
        }
    ]
    
    for (var i = 0; i < fakeJson.length; i++) {
      var nameNode = $("<p></p>").text(fakeJson[i].result.name);
      var submitNode = $("<button></button>");
      submitNode.text("评价").addClass("btn btn-primary btn-comment");
      submitNode.click(function(){
        $('#commentModal').modal('toggle');
      });
      var headerNode  = $("<header></header>").addClass('clearfix');
      var labelNode = $('<div class="stars-outer"><div class="stars-inner"></div></div>').addClass("labelRating");
      headerNode.append(labelNode);



      const starTotal = 5;  
      const starPercentage = (fakeJson[i].result.comments[0].star/ starTotal) * 100;
      const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
      labelNode.find(".stars-inner").width(starPercentageRounded); 
      



      var divNode1 = $("<div></div>").addClass('text').append(headerNode).append(nameNode).append(submitNode);
      var divNode2 = $("<div></div>").addClass('image');
      var divNode3 = $("<div></div>").addClass('front').append(divNode2).append(divNode1);
      var divNode4 = $("<div></div>").addClass('card').append(divNode3);
      var divNode5 = $("<div data-aos='zoom-in'></div>").addClass('fx-wrap').append(divNode4);
      if (i%3 == 0) {
          divNode2.addClass('im1 ');
          $(".col1").append(divNode5);
      }else if(i%3 == 1){
          divNode2.addClass('im2');
          $(".col2").append(divNode5);
      }else{
           divNode2.addClass('im3');
          $(".col3").append(divNode5);
      }
    }

      
      $('#resrating').barrating({
        theme: 'fontawesome-stars'
      });
  
      $('#addres').click(function(){
        $('#newResModal').modal('toggle');
      });

})();




//search animation
$(document).ready(function() {
  var $search = $(".search"),
    $input = $(".search-input"),
    $close = $(".search-close"),
    $svg = $(".search-svg"),
    $path = $(".search-svg__path")[0],
    initD = $svg.data("init"),
    midD = $svg.data("mid"),
    finalD = $svg.data("active"),
    backDelay = 400,
    midAnim = 200,
    bigAnim = 400,
    animating = false;

  $(document).on("click", ".search:not(.active)", function() {
    if (animating) return;
    animating = true;
    $search.addClass("active");

    Snap($path).animate({ path: midD }, midAnim, mina.backin, function() {
      Snap($path).animate(
        { path: finalD },
        bigAnim,
        mina.easeinout,
        function() {
          $input.addClass("visible");
          $input.focus();
          $close.addClass("visible");
          animating = false;
        }
      );
    });
  });

  $(document).on("click", ".search-close", function() {
    if (animating) return;
    animating = true;
    $input.removeClass("visible");
    $close.removeClass("visible");
    $search.removeClass("active");

    setTimeout(function() {
      Snap($path).animate({ path: midD }, bigAnim, mina.easeinout, function() {
        Snap($path).animate(
          { path: initD },
          midAnim,
          mina.easeinout,
          function() {
            animating = false;
          }
        );
      });
    }, backDelay);
  });
});



