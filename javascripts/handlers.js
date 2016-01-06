var rMain = '#main',
    rWork = '#work(_?\\d*)',
    rMood = '#mood(_?\\d*)',
    rPhoto = '#photo(_?\\d*)',
    rInfo = '#info(_?\\d*)',
    rDetail = '#detail(_?\\d*)';

var onDeviceReady = function(){
    Router.set_routes([
        [rMain, mainPage],
        [rWork, workPage],
        [rMood, moodPage],
        [rPhoto, photoPage],
        [rInfo, infoPage],
        [rDetail, detailPage]
    ]);

    Router.set_position([
        [rMain, {leftOf: [rWork,rMood,rPhoto,rInfo,rDetail]}],
        [rWork, {rightOf: [rMain], leftOf: [rDetail]}],
        [rMood, {rightOf: [rMain], leftOf: [rDetail]}],
        [rPhoto, {rightOf: [rMain], leftOf: [rDetail]}],
        [rInfo, {rightOf: [rMain], leftOf: [rDetail]}],
        [rDetail, {rightOf: [rMain,rWork,rMood,rPhoto,rInfo,rDetail]}]
    ]);

    Router.set_ignore("^#http(:?%3A|\:)");
    Router.check_url();

    document.addEventListener(START_EV, function(){tojump = true;}, false);
    document.addEventListener(MOVE_EV, function(){tojump = false;}, false);

    $(document).on(END_EV, '.link', function(){ if(tojump) {
        tojump = false;
        var hash = $(this).attr('rel');
        if (hash) location.hash = hash;
        hidebmenu();
        hidemenu();
    }});

    $(document).on(END_EV,'.backbtn',function(){
        if(!tojump) return false;
        Router.get_back_from(location.hash);
    });

    $(document).on(END_EV,'.menubtn',function(){
        if(!tojump) return false;
        togglemenu([{"title":"返回主页","link":"#main"},{"title":"弹出提示","link":"javascript:do_alert('测试成功');"}]);
        return false;
    });
    
    //键盘动作监听
    document.addEventListener('keydown', function(e){
        if(e.keyCode===27){
            togglebmenu();
            return false;
        }
    }, false);
    
    //视当前手机数据，决定默认页面
    location.hash='#main';
    hideloading();
};

function mainPage(u){
    //读取模板
    var html = $.tmpl('#tmpl_main');
    //新页面滑入
    slide_in(html, rMain, '.frame', function(){
        //滑入完成后的处理
        //开始联网获取数据
        var mainScroller = createIScroll('#mainbodycontainer',false,false,{mouseWheel:true,scrollbars:true,bounceLock:false});
    });
}

function workPage(u){
    var html = $.tmpl('#tmpl_work');
    slide_in(html, rWork, '.frame', function(){
        showloading();
        $.getp(API+'jsondata/work.json',null,false,function(json){
            $('#mbody ul').remove();
            $('#mbody').append('<ul class="list_ul"></ul>');
            for(var i=0;i<json.Data.length;i++){
                $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
            }
            
            var mScroller = createIScroll('#mbodycontainer',function(){
                //刷新动作
                showloading();
                $.getp(API+'jsondata/work.json',null,true,function(json){
                    $('#mbody ul').remove();
                    $('#mbody').append('<ul class="list_ul"></ul>');
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                });
            },function(){
                //加载更多动作
                showloading();
                $.getp(API+'jsondata/work.json',null,true,function(json){
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                    do_timeout(function(){
                        mScroller.scrollBy(0, -30);
                    },500);
                });
            },{mouseWheel:true,scrollbars:true,bounceLock:false});
            hideloading();
        });
    });
}

function moodPage(u){
    var html = $.tmpl('#tmpl_mood');
    slide_in(html, rMood, '.frame', function(){
        showloading();
        $.getp(API+'jsondata/mood.json',null,false,function(json){
            $('#mbody ul').remove();
            $('#mbody').append('<ul class="list_ul"></ul>');
            for(var i=0;i<json.Data.length;i++){
                $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
            }
            
            var mScroller = createIScroll('#mbodycontainer',function(){
                //刷新动作
                showloading();
                $.getp(API+'jsondata/mood.json',null,true,function(json){
                    $('#mbody ul').remove();
                    $('#mbody').append('<ul class="list_ul"></ul>');
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                });
            },function(){
                //加载更多动作
                showloading();
                $.getp(API+'jsondata/mood.json',null,true,function(json){
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                    do_timeout(function(){
                        mScroller.scrollBy(0, -30);
                    },500);
                });
            },{mouseWheel:true,scrollbars:true,bounceLock:false});
            hideloading();
        });
    });
}

function photoPage(u){
    var html = $.tmpl('#tmpl_photo');
    slide_in(html, rPhoto, '.frame', function(){
        showloading();
        $.getp(API+'jsondata/photo.json',null,false,function(json){
            $('#mbody ul').remove();
            $('#mbody').append('<ul class="list_ul"></ul>');
            for(var i=0;i<json.Data.length;i++){
                $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
            }
            
            var mScroller = createIScroll('#mbodycontainer',function(){
                //刷新动作
                showloading();
                $.getp(API+'jsondata/photo.json',null,true,function(json){
                    $('#mbody ul').remove();
                    $('#mbody').append('<ul class="list_ul"></ul>');
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                });
            },function(){
                //加载更多动作
                showloading();
                $.getp(API+'jsondata/photo.json',null,true,function(json){
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody>ul').append('<li class="link" rel="'+json.Data[i].link+'">'+json.Data[i].title+'</li>');
                    }

                    mScroller.refresh();
                    hideloading();
                    do_timeout(function(){
                        mScroller.scrollBy(0, -30);
                    },500);
                });
            },{mouseWheel:true,scrollbars:true,bounceLock:false});
            hideloading();
        });
    });
}

function infoPage(u){
    var html = $.tmpl('#tmpl_info');
    slide_in(html, rInfo, '.frame', function(){
        showloading();
        $.getp(API+'jsondata/info.json',null,false,function(json){
                    $('#mbody dl').remove();
            for(var i=0;i<json.Data.length;i++){
                $('#mbody').append('<dl class="list_dl"><dt>'+json.Data[i].title+'</dt><dd>'+json.Data[i].content+'</dd></dl>');
            }
            
            var mScroller = createIScroll('#mbodycontainer',function(){
                showloading();
                $.getp(API+'jsondata/info.json',null,true,function(json){
                    $('#mbody dl').remove();
                    for(var i=0;i<json.Data.length;i++){
                        $('#mbody').append('<dl class="list_dl"><dt>'+json.Data[i].title+'</dt><dd>'+json.Data[i].content+'</dd></dl>');
                    }

                    mScroller.refresh();
                    hideloading();
                });
            },false,{mouseWheel:true,scrollbars:true,bounceLock:false});
            hideloading();
        });
    });
}

function detailPage(u){
    var html = $.tmpl('#tmpl_detail');
    slide_in(html, rDetail, '.frame', false);
}
