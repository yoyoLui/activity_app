// pages/new_index/new_index.js
var app = getApp();
Page({
  data: {
    has_click: false,
    from_type: 1,
    mobile: '',
    station_list: '',
    showModalStatus: false,
    showUpdatePhone: false,
    url: 'https://img.ejiayou.com/experience_app_img/experience_app_2/headImg_zhuhai.jpg'
  },
  onLoad: function (opt) {
    wx.showNavigationBarLoading();
    var that = this;
    if (app.user_info_data.mobile) {
      that.data.mobile = app.user_info_data.mobile;
    }
    that.setData(that.data);
    wx.showShareMenu({
      withShareTicket: true
    })
    //1、获取身份
    app.activat_zhuhai(function (res) {
      //1.1展现修改手机按钮
      if (app.zhuhai_data.is_show) {
        if (app.zhuhai_data.is_show == 1) {
          that.setData({
            showUpdatePhone: true
          });
        } else {
          that.setData({
            showUpdatePhone: false

          });
        }
      }
      //1.2恭喜成功领卡toast
      app.showToast(app.zhuhai_data.toast, that, 2500);
      //1.3获取分享信息
      that.data.title = app.share_data.title;
      that.setData(that.data);
    });

    //2、获取油站列表    
    app.getStation_zhuhai(function (res) {
      that.data.station_list = res.data;
      that.setData(that.data);
    });
 
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

  onShareAppMessage: function () {
    var that = this;
    //埋点
    if (app.user_info_data.is_white == 1) {
      app.defaultShareClick('LKcRwX');
    }
    if (app.user_info_data.is_white == 0) {
      app.defaultShareClick('t8u0It');

    }
    return {
      title: that.data.title,
      path: '/pages/index/index?&&from_source=1&&from_type=' + app.user_info_data.from_type ,
      success: function (res) {
        console.log("转发成功");
        console.log('打印');
        console.log(res);
        app.showToast('您已成功分享，活动现场可再领取礼品', that, 2500);
        //埋点
        if(app.user_info_data.is_white==1){
          app.defaultShareClick('WeFiCx');
        }
        if (app.user_info_data.is_white==0){
          app.defaultShareClick('pcBNuZ');

        }
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
                  app.uploadGroupInfo_zhuhai(union_id, iv, code, encypt_data, function (res) {
                   
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
  },

  onReachBottom: function () {

  },
})