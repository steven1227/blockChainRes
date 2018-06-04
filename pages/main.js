(function () {

    $('.fadeMe').hide();
    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;
    var result_json = [];
    var res_star = 1;
    var res_star2 = 1;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = { x: width / 2, y: height / 2 };

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height + 'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for (var x = 0; x < width; x = x + width / 20) {
            for (var y = 0; y < height; y = y + height / 20) {
                var px = x + Math.random() * width / 20;
                var py = y + Math.random() * height / 20;
                var p = { x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for (var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for (var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if (!(p1 == p2)) {
                    var placed = false;
                    for (var k = 0; k < 5; k++) {
                        if (!placed) {
                            if (closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for (var k = 0; k < 5; k++) {
                        if (!placed) {
                            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
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
        for (var i in points) {
            var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if (!('ontouchstart' in window)) {
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
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if (document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for (var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in points) {
                // detect points in range
                if (Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if (Math.abs(getDistance(target, points[i])) < 40000) {
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
        TweenLite.to(p, 1 + 1 * Math.random(), {
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
            onComplete: function () {
                shiftPoint(p);
            }
        });
    }

    // Canvas manipulation
    function drawLines(p) {
        if (!p.active) return;
        for (var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
            ctx.stroke();
        }
    }

    function Circle(pos, rad, color) {
        var _this = this;

        // constructor
        (function () {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function () {
            if (!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // api server
    const host = "https://testnet.nebulas.io";
    const endpoint = "/v1/user";
    const call_api = "/call";
    const send_raw_trans = "/rawtransaction";
    const dappContactAddress = "n1x9PncpHC8P8VPVX83MzMVkL5nt9UmZAhr";
    var serialNumber; //交易序列号
    var intervalQuery; //定时查询交易结果

    var nebulas = require("nebulas");
    var HttpRequest = require("nebulas").HttpRequest;
    var Account = require("nebulas").Account;
    var NebPay = require("nebpay");
    var nebPay = new NebPay();
    var neb = new nebulas.Neb();
    neb.setRequest(new HttpRequest(host));
    var accountAddress = "n1LzkF3zqzbCK5f5BQD88G3ejYEZaE67gbH";

    function _sendTrans(func_name, args) {
        var to = dappContactAddress;   //Dapp的合约地址
        var value = "0";
        var callFunction = func_name //调用的函数名称
        var callArgs = args  //参数格式为参数数组的JSON字符串, 比如'["arg"]','["arg1","arg2]'
        var options = {
            //callback 是交易查询服务器地址,
            //callback: NebPay.config.mainnetUrl //在主网查询(默认值)
            callback: NebPay.config.testnetUrl //在测试网查询
        }

        //发送交易(发起智能合约调用)
        serialNumber = nebPay.call(to, value, callFunction, callArgs, options);
        // console.log(serialNumber)
        //设置定时查询交易结果

        $('#newResModal').modal('hide');
        $('#commentModal').modal('hide');
        intervalQuery = setInterval(function () {
            _funcIntervalQuery();
        }, 10000); //建议查询频率10-15s,因为星云链出块时间为15s,并且查询服务器限制每分钟最多查询10次。
    }

    function _call(form_addr, to_addr, nonce, gasPrice, gasLimit, func_name, args_str, resp_proc) {
        neb.api.call({
            chainID: 1,
            from: form_addr,
            to: to_addr,
            value: 0,
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            contract: {
                function: func_name,
                args: args_str
            }
        }).then(function (tx) {
            resp_proc(tx);
        });
    }

    function _funcIntervalQuery() {

        var options = {
            // goods: {        //商品描述
            //     name: "example"
            // },
            //callback 是交易查询服务器地址,
            //callback: NebPay.config.mainnetUrl //在主网查询(默认值)
            callback: NebPay.config.testnetUrl //在测试网查询
        }

        //queryPayInfo的options参数用来指定查询交易的服务器地址,(如果是主网可以忽略,因为默认服务器是在主网查询)
        nebPay.queryPayInfo(serialNumber, options)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                console.log("tx result: " + resp)   //resp is a JSON string
                var respObject = JSON.parse(resp)
                //code==0交易发送成功, status==1交易已被打包上链
                if (respObject.code === 0 && respObject.data.status === 1) {
                    $.notify('评论成功','success');
                    clearInterval(intervalQuery)    //清除定时查询
                }
            })
            .catch(function (err) {
                console.log(err);
                $.notify('评论失败','danger');
            });
    }

    function readall() {
         $('.fadeMe').show();
        var fakeJson = [];
        var resp = _call(accountAddress, dappContactAddress, 42, 1000000, 2000000, "readall", "",
            function (resp) {
                var rlt_json = JSON.parse(resp.result);
                for (var key in rlt_json) {
                    fakeJson.push({
                        "result": {
                            "name": rlt_json[key].name,
                            "avg_score": Math.round(rlt_json[key].total / rlt_json[key].comments.length),
                            "total":rlt_json[key].comments.length
                        }
                    });
                }
                render(fakeJson);
            });
    }


    function read(res_name) {
        var resp = _call(accountAddress, dappContactAddress, 42, 1000000, 2000000, "read", '["' + res_name + '"]',
            function (resp) {
                var rlt_json = JSON.parse(resp.result);
                renderList(rlt_json.comments);
            });
    }


    /*read all data in blockchain*/
    readall();

    function render(fakeJson) {

        for (var i = 0; i < fakeJson.length; i++) {
            var nameNode = $("<p></p>").text(fakeJson[i].result.name);
            var submitNode = $("<button></button>");
            const title = fakeJson[i].result.name;
            submitNode.text("评价").addClass("btn btn-primary btn-comment");
            submitNode.click(function () {
                event.stopPropagation();
                $('#commentModal').modal('toggle');
                $('#commentModal').data('key_name',title);
                $('#resname2').val(title);
            });
            var headerNode = $("<header></header>").addClass('clearfix');
            var labelNode = $('<div class="stars-outer"><div class="stars-inner"></div></div>').addClass("labelRating");
            headerNode.append(labelNode);
            const starTotal = 5;
            const starPercentage = (fakeJson[i].result.avg_score / starTotal) * 100;
            const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
            labelNode.find(".stars-inner").width(starPercentageRounded);

            var numberNode = $('<div>'+fakeJson[i].result.total+'条评价</div>').addClass("labelTotal");
            var divNode1 = $("<div></div>").addClass('text').append(headerNode).append(numberNode).append(nameNode).append(submitNode);
            var divNode2 = $("<div></div>").addClass('image');
            var divNode3 = $("<div></div>").addClass('front').append(divNode2).append(divNode1);
            divNode3.on('click', function (event) {
                event.preventDefault();
                var commentList_data = []
                 $('.fadeMe').show();
                 $('#commentModal').data('key_name',title);
                 read(title);
            });
            var divNode4 = $("<div></div>").addClass('card').append(divNode3);
            var divNode5 = $("<div data-aos='zoom-in'></div>").addClass('fx-wrap').append(divNode4);
            if (i % 3 == 0) {
                divNode2.addClass('im1 ');
                $(".col1").append(divNode5);
            } else if (i % 3 == 1) {
                divNode2.addClass('im2');
                $(".col2").append(divNode5);
            } else {
                divNode2.addClass('im3');
                $(".col3").append(divNode5);
            }
        }
        $('.fadeMe').hide();
    }



    function renderList(fakeComments){
          $(".shabi .modal-body").empty();
          for (var j = 0; j < fakeComments.length; j++) {
              var userHeader = $("<div></div>").prepend('<img src="images/faketou.png" width="80px" height="50px" />').addClass('outerwrapper');
              var labelNode = $('<div class="stars-outer" style="margin-top: 5px"><div class="stars-inner"></div></div>');
              const starTotal = 5;
              const starPercentage = (fakeComments[j].star / starTotal) * 100;
              const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
              labelNode.find(".stars-inner").width(starPercentageRounded);

              var userNamae = $("<div>"+fakeComments[j].author+"</div>");
              var innerWrapper = $("<div></div>").append(userNamae).append(labelNode).addClass("innerWrapper");
              userHeader.append(innerWrapper);
              var userComment = $("<p style='padding-left: 25px;padding-top: 25px;'></p>").text(fakeComments[j].content);
              $(".shabi .modal-body").append(userHeader).append(userComment).append("<hr>");
          }
           $('.fadeMe').hide();
          $('#commentlist').modal('show');
    }


    $('#resrating').barrating({
        theme: 'fontawesome-stars',
        onSelect: function (value, text, event) {
            if (typeof (event) !== 'undefined') {
                // rating was selected by a user
                res_star = value
            } else {
                res_star = value
                // rating was selected programmatically
                // by calling `set` method
            }
        }
    });

    $('#resrating2').barrating({
        theme: 'fontawesome-stars',
        onSelect: function (value, text, event) {
            if (typeof (event) !== 'undefined') {
                // rating was selected by a user
                res_star2 = value
            } else {
                res_star2 = value
                // rating was selected programmatically
                // by calling `set` method
            }
        }
    });

    $('#addres').click(function () {
        $('#newResModal').modal('toggle');
    });

    $('#sidebar-btn').on('click', function () {
        $('#sidebar').toggleClass('visible');
    });


    $('#new-comment-2').click(function(){
      $('#commentModal').modal('toggle');
       $('#commentlist').modal('hide');
        // $('#commentlist').reset();
      $('#resname2').val($('#commentModal').data('key_name'));
    })

    $('#comment').on('click', function () {
        //todo get data from input form;
        var res_name = document.getElementById("resname2").value;
        var comment = document.getElementById("content2").value;
        var args_str = '["' + res_name + '","' + comment + '",' + res_star2+']';
        _sendTrans("comment",args_str);
    });

    $('#new-comment').on('click', function () {
        //todo get data from input form;
        var res_name = document.getElementById("resname").value;
        var comment = document.getElementById("content").value;
        var args_str = '["' + res_name + '","' + comment + '",' + res_star + ']';
        _sendTrans("comment",args_str);
    });

})();

//search animation
$(document).ready(function () {
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


    $(document).on("click", ".search:not(.active)", function () {
        if (animating) return;
        animating = true;
        $search.addClass("active");

        Snap($path).animate({ path: midD }, midAnim, mina.backin, function () {
            Snap($path).animate(
                { path: finalD },
                bigAnim,
                mina.easeinout,
                function () {
                    $input.addClass("visible");
                    $input.focus();
                    $close.addClass("visible");
                    animating = false;
                }
            );
        });
    });


    $(document).on("click", ".search-close", function () {
        if (animating) return;
        animating = true;
        $input.removeClass("visible");
        $close.removeClass("visible");
        $search.removeClass("active");

        setTimeout(function () {
            Snap($path).animate({ path: midD }, bigAnim, mina.easeinout, function () {
                Snap($path).animate(
                    { path: initD },
                    midAnim,
                    mina.easeinout,
                    function () {
                        animating = false;
                    }
                );
            });
        }, backDelay);
    });

});
window.onload
