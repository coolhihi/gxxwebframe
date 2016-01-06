/*
 * WebApp Framework by COoL
 */

//禁用自带滚动响应
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

//全局变量
var tr = function(){if (console && console.log) console.log(Array.prototype.join.apply(arguments, [' ']))},
itr = function(r){if (console && console.info) console.info(r)},
API = '',
//API = '',
SAPI = '',
ANDROID_APP_VERSION ='0.0.1',
IOS_APP_VERSION = '0.0.1',
DA_VER = '0.0.1',
APPNAME = '框架DEMO',
VERSION = 1,
isAndroid = (/android/gi).test(navigator.appVersion),
isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
isWebOS = (/webOS/gi).test(navigator.appVersion),
hasTouch = 'ontouchstart' in window,
START_EV = hasTouch ? 'touchstart' : 'mousedown',
MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
END_EV = hasTouch ? 'touchend' : 'mouseup',
CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
tojump = false;

(function(){
    //路由
    var routes = [], _his = [], _pos, _ignore;
    window.Router = {
        set_routes : function(r) { routes = r },
        history : function(index) {
            //tr('_his: '+_his.join(' >> '));
            return index <= 0 && _his.length + index - 1 >= 0 ?
                _his[_his.length + index - 1] : ''
        },
        set_ignore: function(str) {
            _ignore = new RegExp(str);
        },

        record: function(hash) {
            if(!(_ignore && _ignore.test(hash))) {
                _his[_his.length] = hash;
            }
            if (_his.length > 150) _his.slice(-100);
        },
        set_position: function(pos) {
            _pos = {};
            for (var i=0; i<pos.length; i++){
                var p = pos[i][1];
                _pos[pos[i][0]] = {
                    reLeft : new RegExp((p['leftOf'] || ['$.']).join('|')),
                    reRight : new RegExp((p['rightOf'] || ['$.']).join('|')),
                    reAbove: new RegExp((p['above'] || ['$.']).join('|')),
                    reBelow: new RegExp((p['below'] || ['$.']).join('|'))
                }
            }
        },
        get_position: function(page, lastHash) {
            //tr(_pos[page].reRight);
            //tr(lastHash);
            return !_pos[page] ? 'center':
                _pos[page].reLeft.test(lastHash) ? 'left' :
                _pos[page].reRight.test(lastHash) ? 'right' :
                _pos[page].reAbove.test(lastHash) ? 'bottom_out' :
                _pos[page].reBelow.test(lastHash) ? 'bottom': 'center';
        },
        get_back_from: function(pattern) {
            if(_his.length) {
                var hash = Router.history(-1);
                //tr('_delhis: '+_his.join(' >> '));
                //var hash = Router.history(-1);
                if (!(new RegExp(pattern)).test(hash)) {
                    //Router.record(location.hash);
                    location.hash = hash;
                    return;
                }
            }
        },
        check_url: function(){
            //tr('==>'+ location.hash);
            //$.event.trigger('check_url');
            var match, re;
            Router.record(location.hash);
            //tr('_addhis: '+_his.join(' >> '));
            for (var i=0; i<routes.length; i++){
                re = new RegExp(routes[i][0].replace('/', '\\\/'));
                match = re.exec(location.hash);
                if (match) return routes[i][1](match);
            }
        },
        fixhistory: function(){
            if(_his.length>=3 && _his[_his.length-1]==_his[_his.length-3]){
                _his.pop();
                _his.pop();
            }
        },
        refresh: function(){
            var match, re;
            Router.record(location.hash);
            //tr('_addhis: '+_his.join(' >> '));
            for (var i=0; i<routes.length; i++){
                re = new RegExp(routes[i][0].replace('/', '\\\/'));
                match = re.exec(location.hash);
                if (match) return routes[i][1](match);
            }
        }
    }
    $(window).bind('hashchange', Router.check_url);

    //模板解析
    var cache = {};
    $.tmpl = function(str, data){
        data = data || {};
        if (str[0] == '#') str = $(str).html();
        str = str.trim();
        var fn = cache[str] ||
        new Function("o", "var p=[];with(o){p.push('" +
         str.replace(/[\r\t\n]/g, " ")
         .replace(/'(?=[^%]*%})/g,"\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(/{%=(.+?)%}/g, "',$1,'")
         .split("{%").join("');")
         .split("%}").join("p.push('")
         + "');}return p.join('');");
        return fn.apply(data, [data]);
    }

    $.flush_cache = function(){ cache = {}; }

    var CACHE_EXPIRE = 60000 * 5;
    
//extend from jquery start
    function buildParams( prefix, obj, traditional, add ) {
        var name;

        if ( $.isArray( obj ) ) {
            // Serialize array item.
            $.each( obj, function( i, v ) {
                if ( traditional || rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
                }
            });

        } else if ( !traditional && $.type( obj ) === "object" ) {
            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }

        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    }

    $.param = function( a, traditional ) {
        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                value = $.isFunction( value ) ? value() : ( value == null ? "" : value );
                s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if ( traditional === undefined ) {
            traditional = $.ajaxSettings && $.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if ( $.isArray( a ) || ( false && !$.isPlainObject( a ) ) ) {
            // Serialize the form elements
            $.each( a, function() {
                add( this.name, this.value );
            });

        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], traditional, add );
            }
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( /%20/g, "+" );
    };
//extend from jquery end
    
    $.getp = function(url, data, no_cache, successfunc){
        //tr(url + (url.indexOf('?')==-1?'?':'&') + $.param(data));
        var cache_key = url + '::' + $.param(data);
        if (!no_cache && cache[cache_key]){
            if ((new Date()).getTime() - cache[cache_key].__t < CACHE_EXPIRE) {
                //$.event.trigger('ajaxComplete');
                successfunc(cache[cache_key].__v);
                return;
            } else {
                delete cache[cache_key];
            }
        }

        $.ajax({
            url : url + (url.indexOf('?')==-1?'?':'&') + $.param(data),
            type : 'get',
            cache : false,
            async : false,
            dataType : 'json',
            timeout : 5000,
            success : function(json) {
                if(json.Result==0){
                    cache[cache_key]={
                        __t: (new Date()).getTime(),
                        __v: json
                    }
                    successfunc(json);
                }
                else{
                    tr("错误代码："+json.Result);
                    //showtips("错误代码："+json.Result);
                    if(json.Error=="")
                        showtips("错误代码："+json.Result);
                    else
                        showtips(json.Error);
                }
                return;
            },
            error : function(XMLHttpRequest, textStatus, errorThrown){
                //return {Result:0, Message:"错误代码："+XMLHttpRequest.status};
                tr("错误代码："+XMLHttpRequest.status);
                showtips("错误代码："+XMLHttpRequest.status);
            },
            complete : function(){
            }
        });
        //$.event.trigger('ajaxSend');
        return false;
    }
})();

//显示loading
var showloading = function(txt){
    if(typeof(txt) === 'string')
        $('.loading strong').text(txt);
    if(typeof(loading)==='undefined')
        loading=$('.loading');
    loading.show();
}
//隐藏loading
var hideloading = function(){
    if(typeof(loading)==='undefined')
        loading=$('.loading');
    do_timeout(function(){
        loading.hide();
        $('.loading strong').text('加载中');
    },500);
}

//显示提示
var showtips = function(str){
    $('.tipslayout').remove();
    $(document.body).prepend('<div class="tipslayout"><span>'+str+'</span></div>');
    do_timeout(function(){$('.tipslayout').css('opacity',0);},2000);
}

//显示/隐藏弹出菜单
//可带json数组为参数，设置菜单内容
//[{title:"去第一页",link:"#n1"},{title:"执行JS",link:"javascript:alert('a')"}]
var togglemenu = function(spanArr){
    if(typeof($menu)==='undefined')
        $menu=$('.menulayout');
    if($menu.data('show')){
        $menu.hide().css('opacity','0').data('show',false);
    } else{
        //tr(typeof(spanArr));
        if(typeof(spanArr) === 'object'){
            $menu.empty();
            for(var i=0;i<spanArr.length;i++){
                if(spanArr[i].link.substr(0,1)==='#')
                    $menu.append('<span class="link" rel="'+spanArr[i].link+'">'+spanArr[i].title+'</span>');
                else
                    $menu.append('<span on'+END_EV+'="'+spanArr[i].link+';hidebmenu();hidemenu();">'+spanArr[i].title+'</span>');
            }
        }
        $menu.show().css('marginTop','-'+$menu.height()+'px');
        $menu.css('opacity','1').data('show',true);
    }
}
var hidemenu = function(){
    if(typeof($menu)==='undefined')
        $menu=$('.menulayout');
    if($menu.data('show')){
        $menu.hide().css('opacity','0').data('show',false);
    }
}

//显示/隐藏底部菜单
//可带json数组为参数，设置菜单内容
//[{title:"去第一页",link:"#n1"},{title:"执行JS",link:"javascript:alert('a')"}]
var togglebmenu = function(spanArr){
    if(typeof($bmenu)==='undefined')
        $bmenu=$('.bmenulayout');
    if($bmenu.data('show')){
        $bmenu.css('bottom','-'+$bmenu.height()+'px').data('show',false);
    } else{
        tr(typeof(spanArr));
        if(typeof(spanArr) === 'object'){
            $bmenu.empty();
            for(var i=0;i<spanArr.length;i++){
                $bmenu.append('<span>'+spanArr[i].title+'</span>');
            }
        }
        $bmenu.css('bottom','0').data('show',true);
    }
}
var hidebmenu = function(){
    if(typeof($bmenu)==='undefined')
        $bmenu=$('.bmenulayout');
    if($bmenu.data('show')){
        $bmenu.css('bottom','-'+$bmenu.height()+'px').data('show',false);
    }
}

//新内容切入方法
var slide_in = function(html, page, target_str, cb){
    target = $(target_str);
    if (!target.length) {hideloading();tr('no target'); return }
    if (target.length > 1) {
        for(var i=0; i<target.length-1; i++) {
            $(target[i]).remove();
        }
        target = $(target[i]);
    }
    var par = target.parent(),
        last = Router.history(-1),
        from = Router.get_position(page, last),
        new_frame = $(html);

    //tr(last, '->', page, ': ', from);

    for(var i=0;i<intervalArr.length;i++){
        clearInterval(intervalArr[i]);
    }
    for(var i=0;i<intervalArr.length;i++){
        clearTimeout(timeoutArr[i]);
    }
    if(from == 'center'){
        target.replaceWith(html);
        //target.after(html);
        //target.remove();
        if (cb) cb();
        hideloading();

    } else if (from == 'right' || from == 'left') {
        var start = par.width() * (from == 'right' ? 1:-1);
        new_frame.css('left', start);
        target.after(new_frame);
        //target.imove(-start, 0, 200, function(){target.remove();if (cb) cb();hideloading();});
        //new_frame.imove(-start, 0, 200);
        do_timeout(function(){
        target.css('left',-start);
        new_frame.css('left','0');
        },10);
        do_timeout(function(){target.remove();if (cb) cb();},220);

    } else if (from == 'bottom') {
        new_frame.css('top', par.height()).css('height', target.height());
        target.after(new_frame);
        //new_frame.imove(0, -par.height(), 200, function(){target.remove();if (cb) cb();hideloading();});
        new_frame.css('top','0');
        do_timeout(function(){target.remove();if (cb) cb();},220);

    } else if (from == 'bottom_out') {
        target.before(new_frame);
        //target.imove(0, par.height(), 200, function(){target.remove();if (cb) cb();hideloading();});
        target.css('top',par.height());
        do_timeout(function(){target.remove();if (cb) cb();},220);
    }
    Router.fixhistory();
    //if (cb) cb();
}

var do_alert = function(str, title) {
    title = title || "派芝麻";
    if(isAndroid || isIDevice) {
        navigator.notification.alert(str,
            function(){}, title, "确定");
    } else {
        alert(str);
    }
}
var do_confirm = function(str, config, cb) {
    if (typeof config == 'function') {
        cb = config;
        config = {};
    }
    var title = config['title'] || '派芝麻',
    choice = config['choice'] || ["取消","确定"];
    if(isAndroid || isIDevice) {
        navigator.notification.confirm(str, cb, title, choice);
    } else {
        cb(confirm(str) ? 2 : 1);
    }
}
do_confirm.OK = 2;
do_confirm.CANCEL = 1;

var do_interval = function(func, time) {
    if (typeof func == 'function') {
        intervalArr[intervalArr.length]=setInterval(func, time);
    }
}
var do_timeout = function(func, time) {
    if (typeof func == 'function') {
        timeoutArr[timeoutArr.length]=setTimeout(func, time);
    }
}
intervalArr=new Array();
timeoutArr=new Array();

//手动打开hash
var handleOpenURL = function(url) {
    // invoke from AppDelegate
    location.hash = url;
}

//日期格式化方法
Date.prototype.pattern=function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "日",
        "1" : "一",
        "2" : "二",
        "3" : "三",
        "4" : "四",
        "5" : "五",
        "6" : "六"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "星期" : "周") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

var onBodyLoad = function() {
    if('ontouchstart' in window) {
        if (isIDevice) {
            //document.addEventListener('deviceready', onDeviceReady, false);
            $(onDeviceReady);
        } else {
            /*android and other device*/ 
            $(onDeviceReady);
        }
    } else {
        $(onDeviceReady);
    }
}

var createIScroll = function(selector,pullDownFunc,pullUpFunc,opts,pullText){
    //自定义提示文字
    var pulldownText   = pullText && pullText['pulldownText'] ? pullText['pulldownText'] : '下拉可以刷新',
        pullupText = pullText && pullText['pullupText'] ? pullText['pullupText'] : '上拉加载更多',
        releasedownText  = pullText && pullText['releasedownText'] ? pullText['releasedownText'] : '松手可以刷新',
        releaseupText  = pullText && pullText['releaseupText'] ? pullText['releaseupText'] : '松手加载更多',
        loadingText       = pullText && pullText['loadingText'] ? pullText['loadingText'] : '加载中';
    
    //生成iscroll
    var options = {
        //bounceLock : true,
        //bounceEasing : 'circular'
        scrollbars:false,
        fadeScrollbars:true,
        bounceLock:true,
        momentum:false
    };
    $.extend(true,options,opts);
    var newScroller = new IScroll(selector,options);
    
    //定义下拉和上拉的方法
    if(typeof(pullDownFunc) === 'function' || typeof(pullUpFunc) === 'function'){
        if(typeof(pullDownFunc) === 'function'){
            //tr('有下拉函数');
            var $container = $(selector+'>:first-child');
            $container.prepend('<div class="scroll_pulldown_icon"></div><div class="scroll_pulldown">'+pulldownText+'</div>');
        }
        if(typeof(pullUpFunc) === 'function'){
            //tr('有上拉函数');
            var $container = $(selector+'>:first-child');
            $container.prepend('<div class="scroll_pullup_icon"></div><div class="scroll_pullup">'+pullupText+'</div>');
        }
        //监听滑动，改变图示和文字
        newScroller.on('scrollMove',function(){
            if(this.y>50){
                $('.scroll_pulldown_icon').addClass('scroll_pulldown_flip');
                $('.scroll_pulldown').text(releasedownText);
            }
            else{
                $('.scroll_pulldown_icon').removeClass('scroll_pulldown_flip');
                $('.scroll_pulldown').text(pulldownText);
            }
            if(this.y<-$container.height()+$(selector).height()-50){
                $('.scroll_pullup_icon').addClass('scroll_pullup_flip');
                $('.scroll_pullup').text(releaseupText);
            }
            else{
                $('.scroll_pullup_icon').removeClass('scroll_pullup_flip');
                $('.scroll_pullup').text(pullupText);
            }
            //tr(this.y);
        });
        newScroller.on('scrollEnd',function(){
            if($('.scroll_pulldown_icon').hasClass('scroll_pulldown_flip')){
                $('.scroll_pulldown_icon').removeClass('scroll_pulldown_flip');
                pullDownFunc.call();
            }
            if($('.scroll_pullup_icon').hasClass('scroll_pullup_flip')){
                $('.scroll_pullup_icon').removeClass('scroll_pullup_flip');
                pullUpFunc.call();
            }
        });
    }
    return newScroller;
}