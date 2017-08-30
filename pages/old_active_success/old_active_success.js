// pages/new_index/new_index.js
var app = getApp();
Page({
  data: {
    title:'',
    url: '',
    button_text: ''
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
    this.onLoad();

  },
  onLoad: function (options) {
    var that = this; 
    if (app.user_info_data.from_type == 1) {
      that.data.url = "https://img.ejiayou.com/experience_app_img/experience_app_2/fast_car_head.jpg";
      that.data.button_text = '分享给专快车好友';
    }
    if (app.user_info_data.from_type == 2) {
      that.data.url = "https://img.ejiayou.com/experience_app_img/experience_app_2/truck_car_head.jpg";
      that.data.button_text = '分享给货车好友';
    }
    wx.showShareMenu({
      withShareTicket: true
    })
    that.data.title = app.share_data.title;
    that.setData(that.data);
  },
  onShareAppMessage: function (res) {//拉起分享页面
    var that = this;
    //埋点
    app.defaultShareClick('Tmgttb');
    return {
      title: that.data.title,
      path: '/pages/index/index?&&from_source=0&&from_type=' + app.user_info_data.from_type + "&&user_id=" + app.user_info_data.user_id,
      success: function (res) {//点击分享页面的确定按钮
     
        console.log("转发成功");
        if (res.shareTickets && res.shareTickets.length > 0) {
          
          wx.getShareInfo({//获取分享信息
            shareTicket: res.shareTickets[0],
            success: function (res) {
              wx.login({
                success: function (login_data) {
                  var union_id = app.user_info_data.union_id;
                  var iv = res.iv;
                  var code = login_data.code;
                  var encypt_data = res.encryptedData;
                  app.uploadGroupInfo(union_id, iv, code, encypt_data, function (res) {//上传分享信息
                    //埋点
                    app.defaultShareClick('XEijk9');
                  });
                }
              })
            },
            fail: function (res) {
              // 获取分享信息失败
              console.log("获取分享信息失败");
              console.log(res);
            }
          });
        }
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败");
        console.log(res);
      }
    }
  },
  onReachBottom: function () {

  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    wx.hideNavigationBarLoading();
    wx.hideLoading();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})