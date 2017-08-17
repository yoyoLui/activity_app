// pages/old_index/old_index.js
var app = getApp();
Page({
  data:{
    has_click: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.data.has_click = false;
    wx.showNavigationBarLoading();
    app.getRecordInfo( app.user_info_data.user_id , function(res){
        that.data = res.data;
        that.setData(that.data);
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    wx.hideNavigationBarLoading();
    wx.hideLoading();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //提取加油金
  getMoney : function(e){
    var that = this;
    var form_id = e.detail.formId;
    if (that.data.has_click) {
      return;
    }
    that.data.has_click = true;

    wx.showLoading({
      title: '加载中'
    })

    app.getActivityMoney(app.user_info_data.user_id , form_id , function(res){
      app.getRecordInfo(app.user_info_data.user_id, function (res) {
        that.data.has_click = false;
        that.data = res.data;
        that.setData(that.data);
      });
    });

  }
})