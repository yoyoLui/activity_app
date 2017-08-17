var app = getApp();
Page({
  data: {
    button_able: false,
    mobile: '',
    title: '',
    has_click: false,
    _k: '',
    button_disabled: true,
    button_down_text: '分享到专快车群即可参与',
    button_down_text_add:'加油还可享4~6毛/L长期加油优惠',
    color: 'rgba(12, 17, 19, 0.72)!important'
  },

  onShow: function () {
    wx.hideLoading();
    wx.hideNavigationBarLoading();

  },

  //页面加载
  onLoad: function (option) {
    wx.showNavigationBarLoading();
    var that = this;
    //that.drawliner();
    that.data.head_url = 'https://img.ejiayou.com/experience_app_img/experience_app_2/headImg_zhuhai.jpg';
    that.data.button_down_text = '分享到专快车群即可参与';
    that.setData(that.data);

    that.data.mobile = app.user_info_data.mobile;
    wx.showShareMenu({
      withShareTicket: true
    })
    //判断手机号是否正确
    var isRightPhone;
    if (that.data.mobile != '') {
      isRightPhone = app.util.checkMobile(that.data.mobile);
    }
    if (!isRightPhone) {
      return;
    } else {//正确的手机号码
      that.setData({
        button_disabled: ''
      })
    }

    console.log("login page");
    //获取分享标题
    that.data.title = app.share_data.title;
    console.log('标题' + that.data.title);
    that.setData(that.data);

  },
  formSubmit: function (e) {//获取formId
    console.log('formSubmit=' + JSON.stringify(e.detail));
    app.user_info_data.form_id = e.detail.formId;

  },
  //输入手机
  bindPhoneInput: function (e) {
    var that = this;
    that.setData({
      mobile: e.detail.value.trim()
    });
    if (that.data.mobile.length >= 11) {
      var isRightPhone = app.util.checkMobile(that.data.mobile);
      if (!isRightPhone) {
        that.setData({
          button_disabled: 'true'
        })
        return;
      } else {//正确的手机号码
        that.setData({
          button_disabled: ''
        })
      }
    } else {
      that.setData({
        button_disabled: 'true'
      })
    }

  },

  onShareAppMessage: function (res) {//拉起分享页面
    var that = this;
    if (that.data.button_disabled == 'true') {//按钮没有激活，则返回
      return;
    }else{
      //埋点
      if (app.user_info_data.is_white == 1) {
        app.defaultShareClick('iaRbin');
      }
      if (app.user_info_data.is_white == 0) {
        app.defaultShareClick(' LPk1CX');
      }
    }
    return {
      title: that.data.title,
      path: '/pages/index/index?&&from_source=1&&from_type=' + app.user_info_data.from_type ,
      success: function (res) {//点击分享页面的确定按钮
        wx.showLoading({
          title: '加载中',
        })
        console.log("转发点击了确定,");
        console.log(res);
        if (res.shareTickets && res.shareTickets.length > 0) {//有shareTicket(分享给群,或者从群分享给个人)
          console.log('进入分享群的方法 shareTickets=' + res.shareTickets);
          wx.getShareInfo({//获取分享信息
            shareTicket: res.shareTickets[0],
            success: function (res) {
              console.log('getShareInfo成功');
              wx.login({
                success: function (login_data) {
                  console.log('wx.login成功');
                  var union_id = app.user_info_data.union_id;
                  var iv = res.iv;
                  var code = login_data.code;
                  var encypt_data = res.encryptedData;
                  app.uploadGroupInfo(union_id, iv, code, encypt_data, function (res) {//上传分享信息

                  });
                  that.receive();//receive事件

                },
                fail: function (res) {
                  console.log('wx.login失败，失败返回为：');
                  console.log(res);
                }
              })
            },
            fail: function (resData) {
              // 获取分享信息失败
              console.log("进入分享群，getShareInfo失败，失败返回为：");
              console.log(resData);
              that.receive(); //receive事件
            }
          });

        } else {//分享给个人
          console.log('分享给个人成功');
          that.receive(); //receive事件
        }

      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败");
        console.log(res);
      }
    }
  },
  //点击按钮事件
  receive: function () {
    var that = this;
    var mobile = that.data.mobile;
    console.log('进入receive事件');
    app.receive_zhuhai(mobile, function (res) {//马上领取事件
    console.log('receive返回：'+JSON.stringify(res));
    that.redirectToView();
    });
  },
  //跳转页面
  redirectToView: function () {
    console.log('进入跳转页面事件');
    var that = this;
    wx.redirectTo({
      url: "../received_zhuhai/received_zhuhai",
    })
  },
  drawliner: function () {
    const ctx = wx.createCanvasContext('myCanvas')

    // Create linear gradient
    const grd = ctx.createLinearGradient(0, 0, 0, 36)
    grd.addColorStop(0, 'white')
    grd.addColorStop(1, '#f4f4f4')

    // Fill with gradient
    ctx.setFillStyle(grd)
    ctx.fillRect(0, 0, 600, 36)
    ctx.draw()
  },
  onReachBottom: function () {

  },
})


