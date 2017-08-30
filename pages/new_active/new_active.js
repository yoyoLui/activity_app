// pages/new_index/new_index.js
var app = getApp();
Page({
  data: {
    has_click: false,
    from_type: 1,
    mobile: '',
    station_list: '',
    showModalStatus: false,
    showUpdatePhone: true,
    url: 'https://img.ejiayou.com/experience_app_img/experience_app_2/fast_car_head.jpg'
  },
  onReachBottom: function () {

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
  onLoad: function (opt) {
   
    wx.showNavigationBarLoading();
    var that = this;
    if (app.user_info_data.mobile) {
      that.data.mobile = app.user_info_data.mobile;
    }
    if (app.user_info_data.from_type == 1) {
      that.data.url = "https://img.ejiayou.com/experience_app_img/experience_app_2/fast_car_head.jpg";
    } else {
      that.data.url = "https://img.ejiayou.com/experience_app_img/experience_app_2/truck_car_head.jpg";

    }
    that.setData(that.data);
    //toast弹框
    wx.showShareMenu({
      withShareTicket: true
    })
    //1、获取身份
    console.log('货车拉起弹框 is_alert=' + app.user_info_data.is_alert);
    if (app.user_info_data.is_alert == 1) { //新用户-货车
      that.util("open", "1");
    } else {  //新用户转亏车
      var oil_type = '';
      app.changeCar_type(oil_type, app.user_info_data._k, function () {
    
        that.setData(that.data);
        //展现修改手机按钮
        if (app.user_info_data.is_show) {
          if (app.user_info_data.is_show == 1) {
            that.setData({
              showUpdatePhone: true
            });
          } else {
            that.setData({
              showUpdatePhone: false

            });
          }
        }
        //恭喜成功领卡toast
          app.showToast(app.new_active_data.getTicketMsg, that, 2500);
      });

    }
    //2、获取油站列表    
    app.getStation(function (res) {
      that.data.station_list = res.data;
      that.setData(that.data);
    });
    //3、获取分享信息
      that.data.title = app.share_data.title;
      that.setData(that.data);
  },
  formSubmit: function (e) {//获取formId
    app.user_info_data.form_id = e.detail.formId;
    console.log('formId is ' + app.user_info_data.form_id);
    this.powerDrawer(e.detail.target.dataset);

  },
  powerDrawer: function (dataset) {
    var currentStatu = dataset.statu;
    var oil_type = dataset.type;
    this.util(currentStatu, oil_type)
  },
  //弹框
  util: function (currentStatu, oil_type) {//oil_type=1柴油，oil_type=2汽油
    var that = this;

    setTimeout(function () {
      //弹框关闭  
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
        app.changeCar_type(oil_type, app.user_info_data._k, function () {
            app.showToast(app.new_active_data.getTicketMsg, that, 2500);
          //3、获取分享信息
          that.data.title = app.share_data.title;
          that.setData(that.data);
        });

      }
    }.bind(this), 0)
    // 弹框显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },

  onShareAppMessage: function () {
    var that = this;
    //埋点
    app.defaultShareClick('Coyqh3');
    return {
      title: that.data.title,
      path: '/pages/index/index?&&from_source=0&&from_type=' + app.user_info_data.from_type + "&&user_id=" + app.user_info_data.user_id,
      success: function (res) {

        console.log("转发成功");
        console.log('打印');
        console.log(res);
        if (res.shareTickets && res.shareTickets.length > 0) {

          var shareTickets = res.shareTickets[0];
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function (res) {
              console.log(res);
              wx.login({
                success: function (login_data) {
                  var union_id = app.user_info_data.union_id;
                  var iv = res.iv;
                  var code = login_data.code;
                  var encypt_data = res.encryptedData;
                  app.uploadGroupInfo(union_id, iv, code, encypt_data, function (res) {
                    //埋点
                    app.defaultShareClick('FwESwC');
                    wx.showToast({
                      title: '已转发',
                    })
                  });
                }
              })
            },
            fail: function (res) {
              // 转发失败
              console.log("转发失败");
              console.log(res);
              console.log('shareTicket is' + shareTickets);
            }
          });
        } else {//分享给个人
          console.log('分享给个人，没有shareTicket');
        }
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败");
        console.log(res);
      }
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})