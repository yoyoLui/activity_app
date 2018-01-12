// pages/collect_card/others/others.js
var common = require('../common/common.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag: 0,
    user_info: null,
    others_info: null,
    share_user_info: null,
    show_modal: null,
    show_login: false,
    invite_card_sub_id: common.invite_card_sub_id,
    images: common.images,
    card_category: common.card_category,
    form: {
      phone: '',
      code: '',
      send_success: false,
      count_down: 0,
      can_confirm: false,
      show_loading: false,
    },

    show_toast: null,

    collect_info: null,

    is_attended: 1,

    all_img: [
      common.images.card_xl_colour_ft,
      common.images.card_xl_colour_dz,
      common.images.card_xl_colour_jf,
      common.images.card_xl_colour_bc,
      common.images.card_xl_colour_wl,
    ],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    })

    var others_user_id = options.user_id;

    if (others_user_id == undefined || others_user_id == 'undefined' || others_user_id == '') {
      wx.redirectTo({
        url: '/pages/collect_card_chengdu/index/index'
      })
      return;
    }
    
    that.setData({
      others_info: {
        user_id: others_user_id,
      }
    })

    wx.login({
      success: res => {
        var code = res.code
        console.log('code=' + code)
        wx.getUserInfo({
          success: res => {
            console.log(res)
            wx.request({
              method: "POST",
              url: common.server_url.index,
              data: {
                encrypt_data: res.encryptedData,
                iv: res.iv,
                code: code,
                user_id: that.data.others_info.user_id,
                invite_card_sub_id: common.invite_card_sub_id
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var result = res.data;
                console.log(result);

                //活动结束
                if (result.ret == 21 || result.ret == 22) {
                  wx.redirectTo({
                    url: '/pages/collect_card_chengdu/end/end',
                  })
                  return;
                }

                if (result.ret == 0) {

                  that.setData({
                    collect_info: {
                      num: result.num,
                      money: result.money
                    }
                  })

                  var flag = result.flag == 1 ? 0 : result.flag
                  that.setData({
                    flag: flag,
                    user_info: result.my_info,
                    others_info: result.others_info,
                    is_attended: result.is_attended,
                  })

                  if (result.flag == 2) {
                    that.showCustomToast('抱歉，您不能参加该活动');
                  }

                  wx.hideLoading();
                  wx.hideNavigationBarLoading(); 
                } else {
                  that.showCustomToast(result.msg);
                }
              }
            })
          }
        })
      }
    })
  },

  /**
   * 点击授权微信手机号
   */
  bindGetPhoneNumber: function (e) {
    var that = this
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    if (iv == undefined || encryptedData == undefined) {
      that.setData({
        flag: 1,
        show_login: true
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    wx.request({
      url: common.server_url.get_user_phone,
      data: {
        unionid: that.data.user_info.unionid,
        iv: iv,
        encrypt_data: encryptedData,
        invite_card_sub_id: common.invite_card_sub_id,
      },
      method: 'POST',
      success: function (res) {
        var result = res.data
        console.log(result)
        if (result.ret == 0) {
          if (result.flag == 1) {
            that.setData({
              flag: 1,
              show_login: true
            })
          } else if (result.flag == 2) {
            that.setData({
              flag: 2,
            });
            that.showCustomToast('抱歉，您不能参加该活动');
          } else if (result.flag == 3) {
            that.setData({
              flag: 3,
              ['user_info.user_id']: result.user_id
            })
          }
        }
      },
      fail: function () {
        that.setData({
          flag: 1
        })
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  /**
   * 帮他获得一张 
   */
  bindHelp: function() {
    var that = this;

    wx.request({
      method: "POST",
      url: common.server_url.get_card,
      data: {
        user_info: that.data.user_info,
        user_id: that.data.others_info.user_id,
        invite_card_sub_id: common.invite_card_sub_id,
        flag: 1,//1帮忙,2赠送
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var result = res.data;
        console.log(result)
        if (result.ret == 0) {
          that.setData({
            show_modal: {
              modal_type: 2,
              text: '您帮助了朋友获得了卡片',
              card_name: '“' + that.data.card_category[result.card_type] +'”',
              card_img: common.getCardImg('xl', result.card_type, 1)
            }
          })
        } else if (result.ret == 11) {
          that.setData({
            show_modal: {
              modal_type: 2,
              text: '您已经帮助过该好友获得如下卡片',
              card_name: '“' + that.data.card_category[result.card_type] + '”',
              card_img: common.getCardImg('xl', result.card_type, 1)
            }
          })
        } else {
          that.showCustomToast(result.msg);
        }
      }
    })

  },

  /**
   * 点击隐藏毛玻璃卡片框
   */
  bindHideModal: function () {
    var that = this;
    that.setData({
      show_modal: null
    })
  },

  /**
   * 跳转到活动规则页面
   */
  bindToRulePage: function () {
    //埋点
    var that = this
    var unionid = that.data.user_info.unionid
    wx.request({
      url: common.server_url.save_data,
      data: {
        unionid: unionid,
        click_rule: 1,
        invite_card_sub_id: common.invite_card_sub_id
      }
    })

    wx.navigateTo({
      url: '/pages/collect_card_chengdu/rule/rule'
    })
  },

  /**
   * 显示登录框
   */
  bindShowLogin: function () {
    this.setData({
      show_login: true
    })
  },

  /**
   * 获取输入的手机号码
   */
  bindInputPhone: function (e) {
    var that = this;
    var phone = e.detail.value.trim();

    that.setData({
      ['form.phone']: phone
    });
  },

  /**
   * 点击获取验证码
   */
  bindGetCode: function () {
    var that = this
    var phone = that.data.form.phone;

    console.log(phone)

    if (!common.checkMobile(phone)) {
      that.showCustomToast('手机号码格式不正确');
      return
    }

    wx.request({
      method: "POST",
      url: common.server_url.get_verification_code,
      data: {
        phone: phone
      },
      success: function (res) {
        var result = res.data;
        if (result.ret == 0) {
          wx.showToast({
            title: '获取成功'
          })
          that.setData({
            ['form.count_down']: 60,
            ['form.send_success']: true
          })
          var counts = 60;
          var clock = setInterval(function () {
            counts--;
            if (counts == 0) {
              that.setData({
                ['form.count_down']: 60,
                ['form.send_success']: false
              })
              clearInterval(clock)
              return;
            } else if (counts > 0) {
              that.setData({
                ['form.count_down']: counts
              })
              return;
            } else {
              clearInterval(clock)
            }
          }, 1000);
        } else {
          that.showCustomToast(result.msg);
        }
      },
      fail: function () {
        console.log('短信验证码获取失败')
      }
    })
  },

  /**
   * 获取验证码输入框
   */
  bindInputCode: function (e) {
    var that = this;
    var code = e.detail.value.trim();
    var can_confirm = code.length != 0 ? true : false;
    that.setData({
      ['form.code']: code,
      ['form.can_confirm']: can_confirm
    });
  },

  /**
   * 提交手机号和验证码
   */
  bindConfirm: function () {

    var that = this;

    var phone = that.data.form.phone;
    var code = that.data.form.code;

    if (!common.checkMobile(phone)) {
      that.showCustomToast('手机号码格式不正确');
      return
    }
    if (code.length == 0) {
      that.showCustomToast('请输入验证码');
      return
    }

    //防止多次点击
    that.setData({
      ['form.can_confirm']: false,
      ['form.show_loading']: true,
    })

    wx.request({
      method: "POST",
      url: common.server_url.get_user_info_by_phone,
      data: {
        phone: phone,
        sms_code: code,
        invite_card_sub_id: common.invite_card_sub_id,
        unionid: that.data.user_info.unionid,
      },
      success: function (res) {
        var result = res.data;
        console.log(result);
        if (result.ret == 0) {
          //1去注册，2弹出认证框，3符合身份
          if (result.flag == 1) {
            that.setData({
              flag: 4,
              show_login: false,
              ['user_info.user_id']: result.user_id,
            })
            that.showCustomToast('注册成功，请重新点击帮助好友获得卡片');
          } else if (result.flag == 2) {
            that.setData({
              flag: 2,
              ['user_info.user_id']: result.user_id,
            })
            that.showCustomToast('抱歉，您不能参加该活动');
          } else if (result.flag == 3) {
            that.setData({
              show_login: false,
              ['user_info.user_id']: result.user_id,
              flag: result.flag
            })
          }
          that.setData({
            ['form.phone']: '',
            ['form.code']: '',
          })
        } else {
          that.showCustomToast(result.msg);
        }

      },
      fail: function () {
        console.log('短信验证码获取失败')
      },
      complete: function () {
        that.setData({
          ['form.can_confirm']: true,
          ['form.show_loading']: false,
        })
      }
    })
  },

/**
 * 新用户帮忙
 */
  bindNewHelp: function() {
    var that = this;
    wx.request({
      url: common.server_url.save_register_log,
      data: {
        user_info: that.data.user_info,
        user_id: that.data.others_info.user_id,
        invite_card_sub_id: common.invite_card_sub_id
      },
      method: 'POST',
      success: function (res) { }
    })

    that.showCustomToast('帮助成功！您在易加油油站支付完后，该好友会自动获得“五菱”卡片');
  },

  /**
   * 身份不符合
   */
  bindNotAuth: function () {
    var that = this
    that.showCustomToast('抱歉，您不能参加该活动');
  },

  /**
   * 隐藏登录框
   */
  bindHideLogin: function () {
    this.setData({
      show_login: false,
      ['form.phone']: '',
      ['form.code']: '',
    })
  },

  /**
   * 跳转到个人首页
   */
  bindToIndexPage: function () {
    // 埋点
    var that = this
    var unionid = that.data.user_info.unionid
    var click_join = that.data.flag == 3 ? 1 : 2
    wx.request({
      url: common.server_url.save_data,
      data: {
        unionid: unionid,
        click_join: click_join,
        invite_card_sub_id: common.invite_card_sub_id
      }
    })

    wx.redirectTo({
      url: '/pages/collect_card_chengdu/index/index'
    })
  },

  /**
   * 自定义toast
   */
  showCustomToast: function (title) {
    var that = this
    that.setData({
      show_toast: {
        title: title
      }
    })
    setTimeout(function () {
      that.setData({
        show_toast: null
      })
    }, 1800)
  },

  /**
   * 点击更换图片
   */
  bingClickChangeImg: function (event) {
    var that = this
    var index = event.currentTarget.dataset.index;
    that.setData({
      ['all_img['+index+']']: that.data.all_img[2],
      ['all_img[2]']: that.data.all_img[index]
    })
  },

  /**
   * 拨打客服电话
   */
  bindCallPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '400-8396-555'
    })
  }
})