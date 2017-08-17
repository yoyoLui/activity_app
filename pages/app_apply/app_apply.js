// pages/new_index/new_index.js
var app = getApp();
Page({
  data: {
    button_able: false,
    mobile: "",
    codeflag: 1,
    login_code: "获取验证码",
    sms_code: ""
  },
  onLoad:function(options){
    var that = this;
    wx.showNavigationBarLoading();
    console.log("options");
    console.log(options);
    that.setData(that.data);
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    wx.hideLoading();
    wx.hideNavigationBarLoading();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //输入手机
  bindPhoneInput: function (e) {
    var that = this;
    that.data.mobile = e.detail.value.trim();
  },
  //获取验证码
    sendCode: function () {
      var that = this;
      var timer = 0;
      var time = 30;
      if (that.data.codeflag == 1 && app.util.checkMobile(that.data.mobile)) {
        
        that.data.codeflag = 0;
        app.getSmsCode(that.data.mobile , function(res){

          if(res.ret != 0){
              time = 30;
              that.data.codeflag = 1;
              that.setData({ login_code: "获取验证码", code_css : "able"})
              clearInterval(timer);
          }
          
        });
        that.setData({
          login_code: time + "秒后重发",
          code_css : ""
        })
        timer = setInterval(function () {
          time--;
          if (time == 0) {
            that.data.codeflag = 1;
            that.setData({ login_code: "获取验证码", code_css : "able"})
            clearInterval(timer);
          } else {
            that.setData({
              login_code: time + "秒后重发",
              code_css: ""
            })
          }
        }, 1000);
      }
    },

  //输入手机
  bindPhoneInput: function (e) {
    var that = this;
    that.data.mobile = e.detail.value.trim();
  },

  //输入验证码
  bindCodeInput: function (e) {
    var that = this;
    var sms_code = e.detail.value.trim();
    if (sms_code.length >= 6) {

      app.checkSmsCode(that.data.mobile, sms_code, function (res) {

        //验证失败
        if (res.ret != 0) {
          that.data.codeable = false;
          that.setData({ codeable: that.data.codeable });
          return;
        }

        //验证成功
        that.data.sms_code = sms_code;
        that.data.button_able = true;

      });
    }
  },

  //邮件验证
  isEmail: function(strEmail) { 
    if (strEmail.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1) 
    return true; 
    else
    return false;
  },
  isCardNo: function(card)  
  {  
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X  
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
    if(reg.test(card) === false)  
    {  
        return  false;
    }else{
        return true;
    }
  },
  checkPy : function(t)
  {
    var str = /[a-zA-Z]/;
    return str.test(t);
  },
  //去申请
  toApply: function(e){
    var that = this;
    console.log("toApply");
    console.log(e);
    if(e.detail.value.name.trim() == "" || e.detail.value.pyname.trim() == "" || e.detail.value.number.trim() == "" || e.detail.value.numberarea.trim() == "" || e.detail.value.email.trim() == ""
    || e.detail.value.mobile.trim() == "" || e.detail.value.smscode.trim() == ""){
      wx.showModal({
        title: '提示',
        content: '请填写完整信息'
      })
      return;
    }
    if(e.detail.value.name.trim().length < 2){
        wx.showModal({
        title: '提示',
        content: '名字不少于两个字'
      })
        return;
    }
    if(!that.checkPy(e.detail.value.pyname.trim())){
        wx.showModal({
        title: '提示',
        content: '姓名拼音不合法'
      })
        return;
    }
    if (!that.isEmail(e.detail.value.email.trim())){
        wx.showModal({
        title: '提示',
        content: '邮件格式不正确'
      })
        return;
    }
    if (!that.isCardNo(e.detail.value.number.trim())){
        wx.showModal({
        title: '提示',
        content: '身份证不合法'
      })
        return;
    }
    if(!that.data.button_able){
        wx.showModal({
        title: '提示',
        content: '验证码错误'
      })
        return;
    }

    var _data = {
      union_id: app.app_data.union_id,
      open_id: app.app_data.open_id,
      name: e.detail.value.name.trim(),
      pyname: e.detail.value.pyname.trim(),
      number: e.detail.value.number.trim(),
      numberarea: e.detail.value.numberarea.trim(),
      mobile: e.detail.value.mobile.trim(),
      smscode: e.detail.value.smscode.trim(),
      email: e.detail.value.email.trim()
    };

    app.app_apply_data = _data;

    console.log("提交资料参数");
    console.log(_data);

    wx.navigateTo({
        url: "../upload/upload"
    })
  }
  
})