var app = getApp();
Page({
  data: {
    button_able: false,
    mobile: '',
    title: '',
    has_click: false,
    showModalStatus: false,
    city_id: '',
    _k: '',
    from_type: '',
    car_type: '',
    is_new: '',
    button_disabled: true,
    button_down_text: '分享到专快车群即可领取',
    color: 'rgba(12, 17, 19, 0.72)!important'
  },

  onShow: function () {
    wx.hideLoading();
    wx.hideNavigationBarLoading();
  },
  //页面加载
  onLoad: function (option) {
    var that = this;
    if (app.user_info_data.from_type == 1) {
      that.data.head_url = 'https://img.ejiayou.com/experience_app_img/experience_app_2/fast_car_head.jpg';
      that.data.button_down_text = '分享到专快车群即可领取';
    } else {
      that.data.head_url = "https://img.ejiayou.com/experience_app_img/experience_app_2/truck_car_head.jpg";
      that.data.button_down_text = '分享到货车群即可领取';
    }
    that.setData(that.data);
    wx.showNavigationBarLoading();

    that.data.has_click = false;
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
    }
    return {
      title: that.data.title,
      path: '/pages/index/index?&&from_source=0&&from_type=' + app.user_info_data.from_type + "&&user_id=" + app.user_info_data.user_id,
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
                  var uploadGroupInfoSuccess = false;
                  var receiveSuccess = false;
                  app.uploadGroupInfo(union_id, iv, code, encypt_data, function (res) {//上传分享信息
                    uploadGroupInfoSuccess = true;
                   
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
  //马上领取事件
  receive: function () {
    var that = this;
    var mobile = that.data.mobile;
    console.log('进入receive事件');
    app.receive(mobile, function (res) {//马上领取事件
      //is_new=0是老用户，=1是新用户;from_type=1专快车；from_type=2货车；
      //白名单：
      //car_type默认是5，代表专快车，car_type = 3汽油货车，car_type = 13柴油货车
      //黑名单：
      //car_type默认是10，代表专快车，car_type = 19汽油货车，car_type = 20柴油货车
      that.data._k = res.data.data._k;
      that.data.car_type = res.data.data.car_type;
      that.data.is_new = res.data.data.is_new;
      that.redirectToView();
    });
  },
  //跳转页面
  redirectToView: function () {
    console.log('进入跳转页面事件');
    var that = this;
    //新用户-专快车
    if (app.user_info_data.is_new == 1) {
      wx.redirectTo({
        url: "../new_active/new_active",
      })
    }
    //老用户
    if (app.user_info_data.is_new == 0) {
      wx.redirectTo({
        url: "../old_active/old_active",
      })

    }
  },


})


