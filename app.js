//var server = 'https://yifenshe.top';
var server = 'https://dev.ejiayou.com';
App({

  login_data: null,
  user_info_data: {
    city_id: 0,
    is_show: 0,
  },
  from_data: {
    from_user_id: 0,
    from_city_id: 0,
    from_type: 1,//1=专车 2=货车 test
    from_source: -1,
    channel_no: ''
  },
  position_data: {
    longitude: "",
    latitude: ""
  },
  group_data: {
    open_gid: "",
    share_ticket: "",
    encrypted_data: "",
    iv: ""
  },
  check_login: {
    hasLogin: false,
    hasGetLocation: false,
    hasGetUserInfo: false
  },
  old_active_data: {//老用户数据
    ticketGroup: '',//ticket详情
    stationData: '',//油站详情
    getTicketMsg: ''
  },
  share_data: {
    title: ''
  },
  new_active_data: {//新用户数据
    stationData: '',
    getTicketMsg: ''
  },
  server: server,
  zhuhai_data: {
    is_show: false,
    toast: '',
    stationData: '',
  },
  onLaunch: function (option) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    console.log('onlaunch option is ' + JSON.stringify(option));

    if (option && option.shareTicket) {
      that.group_data.share_ticket = option.shareTicket;
      console.log('option is ' + JSON.stringify(option));
      console.log('that.group_data.share_ticket is ' + JSON.stringify(that.group_data.share_ticket));
    }

  },
  onShow: function () { },
  onHide: function () { },

  //接口api
  server_api: (function (protocol) {
    return {
      get_user_info: protocol + "/activity/experience_1/service/mini_apps/user_info/get",//获取用户信息
      get_sms_code: protocol + "/activity/experience_1/service/mini_apps/verification_code/get",//获取验证码
      sms_code_check: protocol + "/activity/experience_1/service/mini_apps/verification_code/check",//校验验证码
      init_view: protocol + "/activity/experience_1/service/mini_apps/view/init",//判断进入页面
      get_station: protocol + "/activity/experience_1/service/mini_apps/stations/get",//获取油站列表
      uploadGroupInfo: protocol + "/activity/experience_1/service/mini_apps/share/callback",//上传群信息
      get_share_info: protocol + "/activity/experience_1/service/mini_apps/share_info/get",//获取分享信息
      get_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/serach",//获取首页信息
      create_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/add",//提交申请资料
      behaviour: protocol + "/activity/default",//行为记录
      receive: protocol + "/activity/experience_1/service/mini_apps/user/receive",//用户点击"分享领券"
      activat_new: protocol + "/activity/experience_1/service/mini_apps/new_experience/activat",//新用户获得营运车身份
      activat_old: protocol + "/activity/experience_1/service/mini_apps/old_experience/activat",//老用户获得优惠券
      updateMobile: protocol + "/activity/experience_1/service/mini_apps/mobile/update",//修改手机号
      defaultActivity: 'https://yifenshe.top/activity/default',
      getCity_id: protocol + "/activity/experience_1/service/mini_apps/city_id/get",//获取city_id

    }
  })(server),
  //接口api_珠海
  server_api_zhuhai: (function (protocol) {
    return {
      get_user_info: protocol + "/activity/experience_2/service/mini_apps/user_info/get",//获取用户信息
      get_sms_code: protocol + "/activity/experience_2/service/mini_apps/verification_code/get",//获取验证码
      sms_code_check: protocol + "/activity/experience_2/service/mini_apps/verification_code/check",//校验验证码
      init_view: protocol + "/activity/experience_2/service/mini_apps/view/init",//判断进入页面
      get_station: protocol + "/activity/experience_2/service/mini_apps/stations/get",//获取油站列表
      uploadGroupInfo: protocol + "/activity/experience_2/service/mini_apps/share/callback",//上传群信息
      receive: protocol + "/activity/experience_2/service/mini_apps/user/receive",//用户点击"分享领券"
      activat: protocol + "/activity/experience_2/service/mini_apps/experience/activat",//用户获得优惠券（新用户获得专快车，老用户无）
      updateMobile: protocol + "/activity/experience_2/service/mini_apps/mobile/update",//修改手机号
      defaultActivity: 'https://yifenshe.top/activity/default',
      getCity_id: protocol + "/activity/experience_2/service/mini_apps/city_id/get",//获取city_id

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

    //是否在数组内
    inArray: function (car_type, _arr) {
      var len = _arr.length;
      for (var i = 0; i < len; i++) {
        if (car_type == _arr[i]) {
          return true;
        }
      }
      return false;
    }
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
  //根据encryptedData、code获取用户账号信息
  decryptedData: function (fn) {
    var that = this;
    that.getShareEncryptedData(that.group_data.share_ticket, function () {
      that.checkSession(function () {
        wx.request({
          method: "POST",
          url: that.server_api.get_user_info,
          data: {
            encrypt_data: that.user_info_data.encryptedData,
            code: that.login_data.code,
            iv: that.user_info_data.iv,
            encrypt_data1: that.group_data.encrypted_data,
            iv1: that.group_data.iv
          },
          success: function (res) {
            res = res.data;
            //正常
            if (res.ret == 0) {
              that.user_info_data.user_id = res.data.user_id;
              that.user_info_data.union_id = res.data.union_id;
              that.user_info_data.open_id = res.data.open_id;
              that.user_info_data.mobile = res.data.mobile;
              that.group_data.open_gid = res.data.open_gid;
              if (undefined != res.data.is_white) {
                that.user_info_data.is_white = res.data.is_white;
              }
              if (fn) {
                fn();
              }
              return;
            }

            wx.hideLoading();

          },
          fail: function (res) {
            console.log('获取用户信息错误');
            console.log(res);
          }
        });

      });

    });

  },

  //获取分享加密数据与iv
  getShareEncryptedData: function (shareTicket, fn) {
    console.log('获取分享加密数据getShareEncryptedData 参数shareTicket is' + shareTicket);
    var that = this;
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        that.group_data.encrypted_data = res.encryptedData;
        that.group_data.iv = res.iv;
        console.log("decryptedData获取分享信息成功");
        console.log(res);
        if (fn) {
          fn();
        }

      },
      fail: function (res) {
        console.log("decryptedData获取分享信息失败");
        console.log(res);
        if (fn) {
          fn();
        }
      }

    });
  },

  //判断进入哪个页面
  initView: function (fn) {
    var that = this;
    console.log('init接口参数 form_type=' + that.from_data.from_type);
    wx.request({
      method: "POST",
      url: that.server_api.init_view,
      data: {
        user_id: that.user_info_data.user_id,
        open_id: that.user_info_data.open_id,
        union_id: that.user_info_data.union_id,
        mobile: that.user_info_data.mobile,
        open_gid: that.group_data.open_gid,
        from_type: that.from_data.from_type,
        // longitude: that.position_data.longitude,
        //  latitude: that.position_data.latitude
      },
      success: function (res) {
        if (res.data.ret == 0) {
          res = res.data;
          if (fn) {
            fn(res);
          }
        }
      },
      fail: function (res) {
        console.log('初始化页面接口失败');
        console.log(res);
      }
    });
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

  //获取油站
  getStation: function (fn) {
    var that = this;
    console.log('进入获取油站方法');
    var _timer = setInterval(function () {
      if (String(that.user_info_data.city_id).length > 5) {
        clearInterval(_timer);
        wx.request({
          method: "POST",
          url: that.server_api.get_station,
          data: {
            car_type: that.user_info_data.car_type,
            longitude: that.position_data.longitude,
            latitude: that.position_data.latitude,
            open_gid: that.user_info_data.open_gid,
            city_id: that.user_info_data.city_id
          },
          success: function (res) {
            // console.log('获取油站方法成功' + JSON.stringify(res));
            res = res.data;
            if (res.ret == 0) {
              that.old_active_data.stationData = res.data;
              if (fn) {
                fn(res)
              }
            } else {
              wx.showModal({
                showCancel: false,
                title: '提示',
                content: res.msg
              })
            }
          },
          fail: function (res) {
            wx.showToast({
              title: res.msg,
            })
          }
        })
      }
    }, 10);
  },

  //上传群信息
  uploadGroupInfo: function (union_id, iv, code, encypt_data, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.uploadGroupInfo,
      data: {
        union_id: union_id,
        iv: iv,
        code: code,
        encypt_data: encypt_data,
        car_type: that.user_info_data.car_type,
        // city_id: that.user_info_data.city_id
      },
      success: function (res) {
        wx.hideLoading();
        console.log("uploadGroupInfo成功");
        console.log(res);
        if (res.data.ret == 0) {
          res = res.data;
          if (fn) {
            fn(res)
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '提示',
            content: res.msg
          })
        }
      },
      fail: function (res) {
        console.log('uploadShareInfo失败');
        console.log(res);
        if (fn) {
          fn(res)
        }
      }
    });
  },

  //分享领卡
  receive: function (mobile, fn) {
    var that = this;
    wx.request({
      method: "GET",
      url: that.server_api.receive,
      data: {
        mobile: mobile,
        user_id: that.user_info_data.user_id,
        union_id: that.user_info_data.union_id,
        open_id: that.user_info_data.open_id,//是微信那边给用户在我们这个小程序账号下的唯一标识
        nick_name: that.user_info_data.userInfo.nickName,
        avatar_url: that.user_info_data.userInfo.avatarUrl,//头像地址
        open_gid: that.group_data.open_gid,
        city_id: that.user_info_data.city_id,
        from_type: that.user_info_data.from_type,
      },
      success: function (res) {
        //is_new=0是老用户，=1是新用户;from_type=1专快车；from_type=2货车；
        //白名单：
        //car_type默认是5，代表专快车，car_type = 3汽油货车，car_type = 13柴油货车
        //黑名单：
        //car_type默认是10，代表专快车，car_type = 19汽油货车，car_type = 20柴油货车
        //  console.log('分享领券返回：' + JSON.stringify(res));
        if (res.data.ret == 0) {
          that.user_info_data.is_alert = res.data.data.is_alert;
          console.log('receive is_alert=' + res.data.data.is_alert);
          that.user_info_data.is_new = res.data.data.is_new;
          that.user_info_data.mobile = mobile;
          that.user_info_data._k = res.data.data._k;

          if (fn) {
            fn(res)
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '提示',
            content: res.msg
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: res.msg,
        })
      }
    })
  },

  //改变用户车型
  changeCar_type: function (oil_type, _k, fun) {//oil_type=1柴油，oil_type=2汽油
    //is_new=0是老用户，=1是新用户;from_type=1专快车；from_type=2货车；
    //白名单：
    //car_type默认是5，代表专快车，car_type = 3汽油货车，car_type = 13柴油货车
    //黑名单：
    //car_type默认是10，代表专快车，car_type = 19汽油货车，car_type = 20柴油货车
    var that = this;
    if (that.user_info_data.is_white == 1) {//白名单
      if (that.user_info_data.from_type == 1) {//专快车
        that.user_info_data.car_type = 5;
      }
      if (that.user_info_data.from_type == 2) {//货车
        if (oil_type == 2) {//加汽油
          that.user_info_data.car_type = 3;
        }
        if (oil_type == 1) {//加柴油
          that.user_info_data.car_type = 13;
        }
      }
    }
    if (that.user_info_data.is_white == 0) {//黑名单
      if (that.user_info_data.from_type == 1) {//专快车
        that.user_info_data.car_type = 10;
      }
      if (that.user_info_data.from_type == 2) {//货车
        if (oil_type == 2) {//加汽油
          that.user_info_data.car_type = 19;
        }
        if (oil_type == 1) {//加柴油
          that.user_info_data.car_type = 20;
        }
      }
    }
    this.SendCar_type(_k, fun);

  },
  //新用户获得营运车身份
  SendCar_type: function (_k, fun) {
    var that = this;
    var _timer = setInterval(function () {
      if (String(that.user_info_data.city_id).length > 5) {
        clearInterval(_timer);
        wx.request({
          method: "POST",
          url: that.server_api.activat_new,
          data: {
            _k: _k,
            union_id: that.user_info_data.union_id,
            car_type: that.user_info_data.car_type,
            city_id: that.user_info_data.city_id,
            form_id: that.user_info_data.form_id,
            is_white: that.user_info_data.is_white
          },
          success: function (res) {
            that.new_active_data.getTicketMsg = res.data.msg;
            //console.log('新用户领券返回：' + JSON.stringify(res));
            if (res.data.ret == 0) {
              that.user_info_data.is_alert = 0;
              that.user_info_data.is_show = res.data.data.is_show;//0=不显示，1=显示
              that.user_info_data.from_type = res.data.data.from_type;
              console.log('新用户获得营运车身份 from_type=' + that.user_info_data.from_type);
              that.share_data.title = res.data.data.title;
              if (fun) {
                fun();
              }
            }
          },
          fail: function (res) {
            console.log('新用户获得营运车身份失败');
            console.log(res);
          }
        });
      }

    }, 10);
  },
  //老用户获得优惠券
  getTicket: function (_k, fun) {
    var that = this;
    console.log('进入老用户获得优惠券方法');
    var _timer = setInterval(function () {
      if (that.user_info_data._k && that.user_info_data.union_id && String(that.user_info_data.city_id).length > 5) {
        clearInterval(_timer);
        wx.request({
          method: "POST",
          url: that.server_api.activat_old,
          data: {
            _k: that.user_info_data._k,
            union_id: that.user_info_data.union_id,
            city_id: that.user_info_data.city_id,
            is_white: that.user_info_data.is_white
          },
          success: function (res) {
            that.old_active_data.getTicketMsg = res.data.msg;
            if (res.data.ret == 0) {
              that.old_active_data.ticketGroup = res.data.data.merchandises;
              that.user_info_data.from_type = res.data.data.from_type;
              console.log('老用户获得营运车身份 from_type=' + that.user_info_data.from_type);
              that.share_data.title = res.data.data.title;
              if (fun) {
                fun(res.data);
              }
            }
          },
          fail: function (res) {
            console.log('老用户获得优惠券失败');
            console.log(res);
          }
        });
      }
    }, 10);
  },
  //修改手机号
  updateMobile: function (mobile, sms_code, fun) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.updateMobile,
      data: {
        mobile: mobile,
        sms_code: sms_code,
        union_id: that.user_info_data.union_id,
        city_id: that.user_info_data.city_id,
        form_id: that.user_info_data.form_id,
      },
      success: function (res) {
        if (res.data.ret == 0) {
          fun(res.data);
        } else {//修改手机号失败
          console.log('修改手机号失败');
          console.log(res);
          wx.showToast({
            title: res.data.msg,
          })
        }
      },
      fail: function (res) {
        console.log('修改手机号失败');
        console.log(res);
      }
    });
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
  //埋点
  defaultShareClick: function (channel_no) {
    var that = this;
    console.log('掉起埋点 channel_no is ' + channel_no + "," + that.server_api.defaultActivity);
    wx.request({
      method: "POST",
      url: that.server_api.defaultActivity,
      data: {
        channel_no: channel_no,
        user_id: that.user_info_data.city_id,
        openid: that.user_info_data.union_id,
      },
      success: function (res) {
        console.log('埋点成功 channel_no is ' + channel_no);
      }
    })

  },
  //获取city_id
  getCity_id: function (fun) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.getCity_id,
      data: {
        longitude: that.position_data.longitude,
        latitude: that.position_data.latitude,
      },
      success: function (res) {
        if (res.data.ret == 0) {
          that.user_info_data.city_id = res.data.data.city_id;
          if (fun) {
            fun();
          }
        }
      },
      fail: function (res) {
        console.log('获取城市id失败');
        console.log(res);
      }
    })
  },
  /****************************************珠海分界线 *******************************************/
  //获取city_id
  getCity_id_zhuhai: function (fun) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.getCity_id,
      data: {
        longitude: that.position_data.longitude,
        latitude: that.position_data.latitude,
      },
      success: function (res) {
        if (res.data.ret == 0) {
          that.user_info_data.city_id = res.data.data.city_id;
          if (fun) {
            fun();
          }
        }
      },
      fail: function (res) {
        console.log('获取城市id失败');
        console.log(res);
      }
    })
  },
  //根据encryptedData、code获取用户账号信息
  decryptedData_zhuhai: function (fn) {
    var that = this;
    that.getShareEncryptedData_zhuhai(that.group_data.share_ticket, function () {
      that.checkSession_zhuhai(function () {
        wx.request({
          method: "POST",
          url: that.server_api_zhuhai.get_user_info,
          data: {
            encrypt_data: that.user_info_data.encryptedData,
            code: that.login_data.code,
            iv: that.user_info_data.iv,
            encrypt_data1: that.group_data.encrypted_data,
            iv1: that.group_data.iv
          },
          success: function (res) {
            res = res.data;
            console.log('getUserInfo返回 res=' + JSON.stringify(res));
            //正常
            if (res.ret == 0) {
              that.user_info_data.user_id = res.data.user_id;
              that.user_info_data.union_id = res.data.union_id;
              that.user_info_data.open_id = res.data.open_id;
              that.user_info_data.mobile = res.data.mobile;
              that.group_data.open_gid = res.data.open_gid;
              if (undefined != res.data.is_white) {
                that.user_info_data.is_white = res.data.is_white;
              }
              if (fn) {
                fn();
              }
            }
            wx.hideLoading();
          },
          fail: function (res) {
            console.log('获取用户信息错误');
            console.log(res);
          }
        });
      });
    });
  },

  //获取分享加密数据与iv
  getShareEncryptedData_zhuhai: function (shareTicket, fn) {
    console.log('获取分享加密数据getShareEncryptedData 参数shareTicket is' + shareTicket);
    var that = this;
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        that.group_data.encrypted_data = res.encryptedData;
        that.group_data.iv = res.iv;
        console.log("decryptedData获取分享信息成功");
        console.log(res);
        if (fn) {
          fn();
        }
      },
      fail: function (res) {
        console.log("decryptedData获取分享信息失败");
        console.log(res);
        if (fn) {
          fn();
        }
      }

    });
  },
  //检查登录code是否过期
  checkSession_zhuhai: function (fn) {
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

  //判断进入哪个页面
  initView_zhuhai: function (fn) {
    var that = this;
    var options;
    options = {
      user_id: that.user_info_data.user_id,
      open_id: that.user_info_data.open_id,
      union_id: that.user_info_data.union_id,
      mobile: that.user_info_data.mobile,
      open_gid: that.group_data.open_gid,
      from_type: that.from_data.from_type,
    };
    console.log('initView_zhuhai 接口 options=' + JSON.stringify(options));
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.init_view,
      data: options,
      success: function (res) {
        if (res.data.ret == 0) {
          res = res.data;
          if (fn) {
            fn(res);
          }
        }
      },
      fail: function (res) {
        console.log('初始化页面接口失败');
        console.log(res);
      }
    });
  },

  //分享领卡
  receive_zhuhai: function (mobile, fn) {
    var that = this;
    var options = {};
    options = {
      mobile: mobile,
      user_id: that.user_info_data.user_id,
      union_id: that.user_info_data.union_id,
      open_id: that.user_info_data.open_id,//是微信那边给用户在我们这个小程序账号下的唯一标识
      nick_name: that.user_info_data.userInfo.nickName,
      avatar_url: that.user_info_data.userInfo.avatarUrl,//头像地址
      open_gid: that.group_data.open_gid,
      from_type: that.user_info_data.from_type,
    };
    console.log('received接口options=' + JSON.stringify(options));
    wx.request({
      method: "GET",
      url: that.server_api_zhuhai.receive,
      data: options,
      success: function (res) {
        if (res.data.ret == 0) {
          that.user_info_data.is_new = res.data.data.is_new;
          that.user_info_data._k = res.data.data._k;
          that.user_info_data.mobile = mobile;
          if (fn) {
            fn(res)
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '提示',
            content: res.msg
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: res.msg,
        })
      }
    })
  },
  //上传群信息
  uploadGroupInfo_zhuhai: function (union_id, iv, code, encypt_data, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.uploadGroupInfo,
      data: {
        union_id: union_id,
        iv: iv,
        code: code,
        encypt_data: encypt_data,
        car_type: that.user_info_data.car_type,
        // city_id: that.user_info_data.city_id
      },
      success: function (res) {
        wx.hideLoading();
        console.log("uploadGroupInfo成功");
        console.log(res);
        if (res.data.ret == 0) {
          res = res.data;
          if (fn) {
            fn(res)
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '提示',
            content: res.msg
          })
        }
      },
      fail: function (res) {
        console.log('uploadShareInfo失败');
        console.log(res);
        if (fn) {
          fn(res)
        }
      }
    });
  },

  //（新用户获得专快车身份，老用户则无）
  activat_zhuhai: function (fun) {
    var that = this;
    var options;
    options={
      _k: that.user_info_data._k,
      union_id: that.user_info_data.union_id,
      city_id: that.user_info_data.city_id,
      form_id: that.user_info_data.form_id,
      is_white:that.user_info_data.is_white
    };
    console.log('进入activat_zhuhai方法');
    console.log('activat_zhuhai 请求参数' + JSON.stringify(options));
    var _timer = setInterval(function () {
      console.log(that.user_info_data.city_id);
      if (that.user_info_data._k && that.user_info_data.union_id && String(that.user_info_data.city_id).length > 5) {
        clearInterval(_timer);
        wx.request({
          method: "POST",
          url: that.server_api_zhuhai.activat,
          data: options,
          success: function (res) {
            console.log('activat_zhuhai 返回'+JSON.stringify(res));
            that.zhuhai_data.toast = res.data.msg;//toast条显示
            if (res.data.ret == 0) {
              that.zhuhai_data.is_show = res.data.data.is_show;
              that.share_data.title = res.data.data.title;
              if (fun) {
                fun(res.data);
              }
            }
          },
          fail: function (res) {
            console.log('老用户获得优惠券失败');
            console.log(res);
          }
        });
      }
    }, 10);
  },

  //获取油站
  getStation_zhuhai: function (fn) {
    var that = this;
    var options;
    options = {
      car_type: that.user_info_data.car_type,
      longitude: that.position_data.longitude,
      latitude: that.position_data.latitude,
    };
    console.log('进入获取油站方法');
    console.log('getStation_zhuhai 请求参数' + JSON.stringify(options));

    var _timer = setInterval(function () {
      console.log(that.user_info_data.city_id);
      if (String(that.user_info_data.city_id).length > 5) {
        clearInterval(_timer);
        wx.request({
          method: "POST",
          url: that.server_api_zhuhai.get_station,
          data: {
            longitude: that.position_data.longitude,
            latitude: that.position_data.latitude,
          },
          success: function (res) {
            console.log('获取油站方法成功' + JSON.stringify(res));
            res = res.data;
            if (res.ret == 0) {
              that.zhuhai_data.stationData = res.data;
              if (fn) {
                fn(res)
              }
            } else {
              wx.showModal({
                showCancel: false,
                title: '提示',
                content: res.msg
              })
            }
          },
          fail: function (res) {
            wx.showToast({
              title: res.msg,
            })
          }
        })
      }
    }, 10);
  },
  //获取验证码
  getSmsCode_zhuhai: function (mobile, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.get_sms_code,
      data: {
        mobile: mobile,
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
  checkSmsCode_zhuhai: function (mobile, sms_code, fn) {
    var that = this;
    wx.showLoading({
      title: '验证中',
    })
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.sms_code_check,
      data: {
        mobile: mobile,
        sms_code: sms_code,
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
  //修改手机号
  updateMobile_zhuhai: function (mobile, sms_code, fun) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api_zhuhai.updateMobile,
      data: {
        mobile: mobile,
        sms_code: sms_code,
        union_id: that.user_info_data.union_id,
        city_id: that.user_info_data.city_id,
      },
      success: function (res) {
        if (res.data.ret == 0) {
          fun(res.data);
        } else {//修改手机号失败
          console.log('修改手机号失败');
          console.log(res);
          wx.showToast({
            title: res.data.msg,
          })
        }
      },
      fail: function (res) {
        console.log('修改手机号失败');
        console.log(res);
      }
    });
  },
})

