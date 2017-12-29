// var server = 'https://yifenshe.top';
var server = 'https://dev.ejiayou.com';
App({
  login_data: null,
  options: null,
  server: server,
  app_data: {},
  app_apply_data: {},
  onLaunch: function (option) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    console.log('onlaunch option is ' + JSON.stringify(option));
   
  },
  onShow: function () { },
  onHide: function () { },
  onError: function (res) {
    console.log('app报错' + JSON.stringify(res));
  },
  //接口api
  server_api: (function (protocol) {
    return {
      get_sms_code: protocol + "/activity/experience_1/service/mini_apps/verification_code/get",//获取验证码
      sms_code_check: protocol + "/activity/experience_1/service/mini_apps/verification_code/check",//校验验证码
      get_user_info: protocol + "/activity/experience/service/mini_apps/user_info/get",//获取用户信息
      get_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/serach",//获取首页信息
      create_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/add",//提交申请资料
    }
  })(server),

  //接口输入车牌号领礼品卡
  server_api_chargeCard: (function (protocol) {
    return {

      getUnionId: protocol + '/v1/openapi/decodeUserInfo.do',
      initView: protocol + '/v1/gifcard/check.do',
      recharge: protocol + '/v1/gifcard/recharge.do'
    }
  })(server),

  //工具类
  util: {
    //检查手机
    checkMobile: function checkMobile(phone) {
      if (!(/^1[0-9][0-9]\d{8}$/.test(phone))) {
        wx.showToast({
          title: "请输入正确的手机号",
          duration: 1000
        })
        return false;
      }
      return true;
    },
  },
  //检查登录code是否过期
  checkSession: function (fn) {
    var that = this;
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        if (fn) {
          fn()
        }
      },
      fail: function () {
        //登录态过期
        wx.login({
          success: function (login_data) {
            that.login_data.code = login_data.code;
            if (fn) {
              fn();
            }
          }
        });
      }
    })
  },

  //获取验证码
  getSmsCode: function (mobile, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.get_sms_code,
      data: {
        mobile: mobile,
        open_gid: that.group_data.open_gid,
        city_id: that.user_info_data.city_id
      },
      success: function (res) {
        wx.hideLoading();
        res = res.data;
        if (res.ret == 0) {
          wx.showToast({
            title: '获取验证码成功',
            icon: 'success',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: '获取验证码失败',
            icon: 'success',
            duration: 1000
          })
        }

        if (fn) {
          fn(res)
        }
      },
      fail: function (res) {
        console.log('获取验证码失败');
        console.log(res);
      }
    })
  },

  //校验验证码
  checkSmsCode: function (mobile, sms_code, fn) {
    var that = this;
    wx.showLoading({
      title: '验证中',
    })
    wx.request({
      method: "POST",
      url: that.server_api.sms_code_check,
      data: {
        mobile: mobile,
        sms_code: sms_code,
        open_gid: that.group_data.open_gid,
        city_id: that.user_info_data.city_id
      },
      success: function (res) {
        console.log('校验验证码成功返回:');
        console.log(res);
        res = res.data;
        wx.hideLoading();
        if (fn) {
          fn(res)
        }
        if (res.ret != 0) {
          wx.showToast({
            title: "验证码错误",
            //icon: 'success',
            image: '',
            duration: 1000
          })
        }

      },
      fail: function (res) {
        console.log('校验验证码失败');
        console.log(res);
      }
    })
  },

  //自定义toast  
  showToast: function (text, o, count) {
    text = text.replace("\"", "").replace("\"", "").replace("\'", "").replace("\'", "");
    var _this = o; count = parseInt(count) ? parseInt(count) : 3000;
    _this.setData({ toastText: text, isShowToast: true, });
    setTimeout(function () {
      _this.setData({ isShowToast: false });
    }, count);
  },

  // ##########################输入车牌号领礼品卡分界线##################################
  //校验礼品卡
  initView_chargeCard: function (gifCardSerial, fun) {
    var that = this;
    console.log('initView_chargeCard cardSerial=' + gifCardSerial);
    wx.request({
      method: "GET",
      url: that.server_api_chargeCard.initView,
      data: {
        cardSerial: gifCardSerial,
      },
      success: function (res) {
        console.log('initView_chargeCard res=' + JSON.stringify(res.data));
        if (parseInt(res.data.code) == 200) {
          if (fun) {
            fun(res.data.data);
          }
        } else {
          if (fun) {
            fun('对不起，刚刚系统开小差儿走开一会，请重新充值');
          }
        }
      },
      fail: function () {
        if (fun) {
          fun('网络异常，请检查网络重新充值');
        }
      }
    })
  },
  getUnionId_chargeCard: function (code, encryptedData, iv, fun) {
    var that = this;
    var options = {
      code: code,
      encryptedData: encryptedData,
      iv: iv
    };
    console.log('getUnionId_chargeCard options=' + JSON.stringify(options));
    wx.request({
      method: "POST",
      url: that.server_api_chargeCard.getUnionId,
      data: options,
      success: function (res) {
        console.log('getUnionId_chargeCard res=' + JSON.stringify(res.data));
        if (parseInt(res.data.code) == 200) {
          if (fun) {
            fun(res.data.data);
          }
        } else {
          wx.showModal({
            title: '',
            content: '服务器错误',
            showCancel: false
          })
        }
      },

    })
  },

  //绑定
  recharge: function (carNum, gifCardSerial, unionId, formId, openId, fun) {
    var that = this;
    var options = {
      carNum: carNum,
      gifCardSerial: gifCardSerial,
      unionId: unionId,
      formIds: formId,
      openId: openId
    };
    console.log('getUnionId_chargeCard options=' + JSON.stringify(options));
    wx.request({
      method: "POST",
      url: that.server_api_chargeCard.recharge,
      data: options,
      success: function (res) {
        console.log('recharge res=' + JSON.stringify(res.data));
        if (parseInt(res.data.code)) {
          if (fun) {
            fun(res.data.code, res.data.data);
          }
        } else {
          if (fun) {
            fun(false, '对不起，刚刚系统开小差儿走开一会，请重新充值');
          }
        }
      },
      fail: function () {
        if (fun) {
          fun(false, '网络异常，请检查网络重新充值');
        }
      }
    })
  }
})

