// pages/new_index/new_index.js
var app = getApp();
var app2;
Page({
  data: {
    is_index: false,
    is_activity: false,
    is_activity_zhuhai: false,
    show_bk: true,
    show_mycard: false,
    nocard: true,
    success: false,
    audting: false,
    bk_checked_image: "https://img.ejiayou.com/experience_app_img/card_orange@2x.png",
    mycard_checked_image: "https://img.ejiayou.com/experience_app_img/mine_grey@2x.png",
    navigate_url: ""
  },

  onLoad: function (options) {

    //开关
    //app.from_data.channel_no = 1;
    //options.from_source = 0;//活动
    //options.from_source = 1;//珠海红包
    var that = this;
    //有from_source进入活动，没有from_source进入首页
    if (undefined != options && undefined != options.from_source) {

      that.data.is_index = false;
      app.is_index = false;

      wx.showLoading({
        title: '加载中'
      })
      if (options.from_source == 0) {
        that.data.is_activity = true;
        // 页面初始化 options为页面跳转所带来的参数
        if (undefined != options && undefined != options.from_user_id) {
          app.from_data.from_user_id = options.from_user_id;
        }
        if (undefined != options && undefined != options.from_type) {
          app.from_data.from_type = options.from_type;
          console.log('获取option的from_type form_type=' + app.from_data.from_type);
        }
        if (undefined != options && undefined != options.from_city_id) {
          app.from_data.from_city_id = options.from_city_id;
        }
        //来源,0=分享 1=公众号支付完成模板消息 2=支付完成 3=服务通知 4=图文消息(批量推送等)
        if (undefined != options && undefined != options.channel_no) {
          app.from_data.channel_no = options.channel_no;
        }
        if (undefined != options && undefined != options.from_source) {
          app.from_data.from_source = options.from_source;
        }
        that.toActivity();
      } else if (options.from_source == 1) {//珠海红包
        that.data.is_activity_zhuhai = true;
        if (undefined != options && undefined != options.from_type) {
          app.from_data.from_type = options.from_type;
          console.log('获取option的from_type form_type=' + app.from_data.from_type);
        }
        if (undefined != options && undefined != options.channel_no) {
          app.from_data.channel_no = options.channel_no;
        }
        if (undefined != options && undefined != options.from_source) {
          app.from_data.from_source = options.from_source;
        }
        that.toActivity_zhuhai();


      }
    }

    //进入首页
    else {
      that.data.is_index = true;
      app.is_index = true;
    }

    if (app.from_data.from_source == -1) {
      that.data.is_index = true;
      app.is_index = true;
    } else {
      that.data.is_index = false;
      app.is_index = false;
    }
    that.setData(that.data);
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this;
    if (that.data.is_index) {
      that.toIndex();
    }

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  toApply: function () {
    var that = this;

    if (that.data.audting) {
      wx.showModal({
        showCancel: false,
        title: '温馨提示',
        content: '您的资料正在审核中'
      })
      return;
    }
    if (that.data.success) {
      wx.showModal({
        showCancel: false,
        title: '温馨提示',
        content: '您的专属油卡已激活成功，我们会有专属客服与您联系，请保持手机畅通'
      })
      return;
    }

    wx.showLoading({
      title: '加载中',
    })
    wx.navigateTo({
      url: "../app_apply/app_apply"
    })
  },
  bk: function () {
    var that = this;
    that.data.show_bk = true;
    that.data.show_mycard = false;
    that.data.bk_checked_image = "https://img.ejiayou.com/experience_app_img/card_orange@2x.png";
    that.data.mycard_checked_image = "https://img.ejiayou.com/experience_app_img/mine_grey@2x.png";
    that.setData(that.data);
  },
  my: function () {
    var that = this;
    that.data.show_bk = false;
    that.data.show_mycard = true;
    that.data.bk_checked_image = "https://img.ejiayou.com/experience_app_img/card_grey@2x.png";
    that.data.mycard_checked_image = "https://img.ejiayou.com/experience_app_img/mine_orange@2x.png";
    that.setData(that.data);
  },

  //首页
  toIndex: function () {
    wx.showNavigationBarLoading();
    wx.hideLoading();
    var that = this;

    //获取用户数据
    wx.login({
      success: function (login_data) {

        app.login_data = login_data;

        app.checkSession(function () {
          wx.getUserInfo({
            success: function (user_info_data) {
              wx.request({
                method: "POST",
                url: app.server_api.get_user_info,
                data: {
                  encrypt_data: user_info_data.encryptedData,
                  code: app.login_data.code,
                  iv: user_info_data.iv
                },
                success: function (res) {
                  res = res.data;
                  app.app_data = res.data;

                  //获取用户数据
                  wx.request({
                    method: "POST",
                    url: app.server_api.get_app_data,
                    data: {
                      union_id: res.data.union_id
                    },
                    success: function (res) {
                      res = res.data.data;
                      wx.hideLoading();
                      wx.hideNavigationBarLoading();
                      //没有卡
                      if (res.status == 0) {
                        that.data.nocard = true;
                        that.data.audting = false;
                        that.data.success = false;
                      }
                      //审核中
                      if (res.status == 1) {
                        that.data.nocard = false;
                        that.data.audting = true;
                        that.data.success = false;
                      }
                      //审核通过
                      if (res.status == 2) {
                        that.data.nocard = false;
                        that.data.audting = false;
                        that.data.success = true;
                      }
                      that.setData(that.data);
                    }
                  })


                },
                fail: function (res) {
                  wx.showModal({
                    showCancel: false,
                    title: '错误',
                    content: "获取用户信息错误"
                  })
                }
              });

            }
          })

        });

      }
    });

  },
  //进入活动
  toActivity: function () {
    console.log('有进入活动事件toActivity');
    var that = this;
    //获取登录信息
    wx.login({
      success: function (login_data) {
        console.log('login is' + JSON.stringify(login_data));
        app.login_data = login_data;
        app.check_login.hasLogin = true;
      }
    });

    //获取用户信息
    wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
      success: function (user_info_data) {
        app.user_info_data = user_info_data;
        app.user_info_data.city_id = 1;
        app.check_login.hasGetUserInfo = true;
        //获取经纬度
        wx.getLocation({
          success: function (res) {
            console.log('getLocation is' + JSON.stringify(res));
            app.position_data = res;
            app.getCity_id();
          },
          fail: function (res) {
          }
        })
      }
    })


    var _timer = setInterval(function () {
      if (app.check_login.hasLogin && app.check_login.hasGetUserInfo) {
        clearInterval(_timer);
        console.log('进入initController条件成功');
        that.initController();

      }
    }, 10);

  },

  //初始化页面
  initController: function () {
    console.log('有进入initController事件');
    var that = this;
    app.decryptedData(function () {
      console.log('进入decryptedData回调');

      app.initView(function (res) {
        app.user_info_data.from_type = res.data.from_type;
        app.user_info_data._k = res.data._k;
        app.user_info_data.mobile = res.data.mobile;
        app.share_data.title = res.data.title;
        //埋点-channel_no
        // app.defaultShareClick(app.from_data.channel_no);
        //输入手机号页面
        if (res.type == 1) {
          wx.redirectTo({
            url: "../login/login"
          })
        }
        //进入老用户成功领取组合券页面
        if (res.type == 2) {
          wx.redirectTo({
            url: "../old_active/old_active"
          })
        }
        //进入分享页
        if (res.type == 3) {
          wx.redirectTo({
            url: "../old_active_success/old_active_success"
          })
        }
        //进入新用户页面
        if (res.type == 4) {
          wx.redirectTo({
            url: "../new_active/new_active"
          })
        }
      });

    });
  },

  //进入活动_珠海
  toActivity_zhuhai: function () {
    app.check_login.hasGetUserInfo = false;
    app.check_login.hasLogin = false;

    console.log('有进入活动事件toActivity_zhuhai');
    var that = this;
    app.user_info_data.city_id = 440400;
    //获取经纬度（定时器是为了防止user_info_data被覆盖掉，就没有了city_id）
    wx.getLocation({
      success: function (res) {
        var _timer = setInterval(function () {
          if (app.check_login.hasGetUserInfo) {
            clearInterval(_timer);
            console.log('getLocation is' + JSON.stringify(res));
            app.position_data = res;
            console.log('经纬度 position_data=' + JSON.stringify(app.position_data));
            app.getCity_id_zhuhai();
          }
        }, 100);
      },
      fail: function (res) {
        app.zhuhai_data.isGetCity_id = true;
      }
    })
    //获取登录信息
    wx.login({
      success: function (login_data) {
        app.login_data = login_data;
        app.check_login.hasLogin = true;
      }
    });

    //获取用户信息
    wx.getUserInfo({
      //首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
      success: function (user_info_data) {
        // console.log('调用微信接口 user_info_data=' + JSON.stringify(user_info_data));
        app.user_info_data = user_info_data;
        app.check_login.hasGetUserInfo = true;

      }
    })

    var _timer = setInterval(function () {
      if (app.check_login.hasLogin && app.check_login.hasGetUserInfo) {
        clearInterval(_timer);
        console.log('进入initController条件成功');
        that.initController_zhuhai();
      }
    }, 10);

  },

  //初始化页面_珠海
  initController_zhuhai: function () {
    console.log('有进入initController事件');
 
    var that = this;
    app.decryptedData_zhuhai(function () {
      console.log('进入decryptedData回调');
      app.initView_zhuhai(function (res) {
        console.log('init初始化页面返回res=' + JSON.stringify(res));
        app.user_info_data.from_type = res.data.from_type;
        app.user_info_data._k = res.data._k;
        app.user_info_data.mobile = res.data.mobile;
        app.share_data.title = res.data.title;
        //输入手机号页面
        if (res.type == 1) {
          wx.redirectTo({
            url: "../login_zhuhai/login_zhuhai"
          })
        }
        if (res.type == 2) {
          wx.redirectTo({
            url: '../received_zhuhai/received_zhuhai',
          })
        }
      });
    });
  }
})