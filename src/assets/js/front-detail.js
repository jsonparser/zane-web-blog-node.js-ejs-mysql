// 前台首页
$(()=>{
    
	// 加载输入框
	let subtext = ''
	let E = window.wangEditor
    let editor = new E('#editor')
     editor.customConfig.menus = [
	    'head',  // 标题
	    'bold',  // 粗体
	    'italic',  // 斜体
	    'list',  // 列表
	    'emoticon',  // 表情
	    'image',  // 插入图片
	    'code',  // 插入代码
	]
    editor.customConfig.uploadImgServer = config.baseApi+'upload'
    editor.customConfig.uploadFileName = 'file'
    editor.customConfig.withCredentials = true
    editor.customConfig.uploadImgTimeout = 12000
    // 将图片大小限制为 500kb
    editor.customConfig.uploadImgMaxSize = 500 * 1024

    editor.customConfig.uploadImgHooks = {
        success: function (xhr, editor, result) {
        },
        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        customInsert: function (insertImg, result, editor) {
            let url = config.imgBaseUrl + result.data
            insertImg(url)
        }
    }
    // editor.customConfig.uploadImgShowBase64 = true
    editor.customConfig.onchange = (html) => {
        subtext=html
    }
    editor.create() 

    setTimeout(()=>{
        $('div.w-e-text-container').css({height:'150px'})
    },0)

	// 极验验证
	let handler = (captchaObj) => {
        captchaObj.appendTo('#captcha');
        captchaObj.onReady(()=> {
            $("#wait").hide();
        });
        $('#btn').click(()=> {
            let result = captchaObj.getValidate();

            if (!subtext) {Layer.alert({width:300,height:150,type:"msg",title:"请填写需要评论的内容!"}); return false;}
            if (!result) {Layer.alert({width:300,height:150,type:"msg",title:"请完成验证!"}); return false;}

            $.ajax({
                url: '/api/gt/validate-slide',
                type: 'POST',
                dataType: 'json',
                data: {
                    text: subtext,
                    articleId:$('#articleId').text(),
                    articleName:$('title').text(),
                    geetest_challenge: result.geetest_challenge,
                    geetest_validate: result.geetest_validate,
                    geetest_seccode: result.geetest_seccode
                },
                success: function (data) {
                	if(data.code == 1000){
                		Layer.miss({width:250,height:90,title:"发布成功!",time:2000})
                		captchaObj.reset();
                		editor.txt.html('')
                        let str = `<div class="item">
                            <img class="people" src="/images/index/01.jpg">
                            <div class="text">${data.data.text} <span class="default">${data.data.createTime}</span></div>
                        </div>`
                        $("#commenttext").find('div.item').eq(0).before(str)
                	}else{
                		Layer.miss({width:250,height:90,title:data.desc,time:2000})
                		captchaObj.reset();
                	}
                }
            });
        })
    };

    $.ajax({
        url: "/api/gt/register-slide?t=" + (new Date()).getTime(), // 加随机数防止缓存
        type: "get",
        dataType: "json",
        success:(data)=> {
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success, // 表示用户后台检测极验服务器是否宕机
                new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
                product: "float", // 产品形式，包括：float，popup
                width: "3rem"
            }, handler);
        }
    });

    //判断是否立即滚动到评论框
    let isComment = util.getQueryString('isComment') || ""
    if(isComment === 'true'){
        let scrollTop = $('#editor').offset().top;
        setTimeout(()=>{
            $(window).scrollTop(scrollTop);
        },200)
    };

    // 文章浏览量++
    util.ajax({
        url:config.baseApi+'api/article/addBrowse',
        data:{
            browse:$('#browse-number').text(),
            id:$('#articleId').text()
        },
        success:data=>{

        }
    })

    // 切换打赏二维码
    $('#tab-chose-type').children().click(function(){
        let index = $(this).index();
        $('#tab-pay-img').find('img').eq(index).show().siblings().hide();
    })
    $('span.close').click(function(){
        $('#dasang').find('div.model-mask').hide();
        $('#dasang').find('div.model-dasang').hide();
    })
    $('#dasang-btn').click(function(){
        $('#dasang').find('div.model-mask').show();
        $('#dasang').find('div.model-dasang').show();
    })

})

