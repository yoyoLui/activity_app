// pages/collect_card/index/index.js

var common = require('../common/common.js');

var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag: 0,
    user_info: null,
    card_info_list: null,
    selected: null,
    get_card_lists: null,
    show_modal: null,
    show_login: false,
    show_auth: null,
    complete: false,
    images: common.images,
    card_category: common.card_category,
    text_category: common.text_category,

    form: {
      phone: '',
      code: '',
      send_success: false,
      count_down: 0,
      can_confirm: false,
      show_loading: false,
    },

    channel: null,

    show_toast: null,

    collect_info: null,

    if_submit: 1,
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.onLoad({});
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorage({
      key: 'collectCard',
      data: '/pages/collect_card_zhuhai/index/index',
    })
    var that = this

    wx.showLoading({
      title: '加载中',
      mask: true,
    })

    var card_id = options.card_id != undefined ? options.card_id : '';


    if (options.channel != undefined) {
      that.setData({
        channel: '1'
      })
    }


    //设置默认数据
    if (this.data.card_info_list == null) {
      var arr = new Array();
      for (var i = 1; i < 6; i++) {
        arr[i - 1] = {
          card_type: i,
          card_num: 0,
          card_img: common.getCardImg('sm', i, 0),
          list: []
        }
      }
      that.setData({
        card_info_list: arr,
        selected: {
          card_type: 1,
          card_num: 0,
          card_img: common.getCardImg('xl', 1, 0),
        },
      })
    }

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
                get_card_log_id: card_id,
                invite_card_sub_id: common.invite_card_sub_id,
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
                    url: '/pages/collect_card_zhuhai/end/end',
                  })
                  return;
                }

                if (result.ret == 0) {

                  that.setData({
                    collect_info: {
                      num: result.num,
                      money: result.money,
                    }
                  })

                  var flag = result.flag == 1 ? 0 : result.flag
                  that.setData({
                    flag: flag,
                    user_info: result.my_info,
                  })

                  if (result.flag == 2) {
                    that.setData({
                      show_auth: {
                        show_auth: false,
                        show_view: false,
                        view_url_list: result.url,
                      },
                      if_submit: result.if_submit,
                    })
                  }

                  //成功数据
                  var card_info_list = that.data.card_info_list;
                  for (var i = 0; i < 5; i++) {
                    var none = true
                    for (var j = 0, len = result.my_card_lists.length; j < len; j++) {
                      var item = result.my_card_lists[j];
                      if (i + 1 == item.card_type) {
                        card_info_list[i].card_num = item.card_num;
                        card_info_list[i].card_img = common.getCardImg('sm', item.card_type, item.card_num);
                        card_info_list[i].list = item.list;
                        none = false;
                        break;
                      }
                    }
                    if (none) {
                      card_info_list[i].card_num = 0;
                      card_info_list[i].card_img = common.getCardImg('sm', i + 1, 0);
                      card_info_list[i].list = [];
                    }
                  }

                  var selected = new Object();
                  selected.card_type = card_info_list[0].card_type;
                  selected.card_num = card_info_list[0].card_num;
                  selected.card_img = common.getCardImg('xl', card_info_list[0].card_type, card_info_list[0].card_num);

                  that.setData({
                    card_info_list: card_info_list,
                    selected: selected
                  })

                  console.log(that.data.card_info_list);

                  that.setData({
                    get_card_lists: result.get_card_lists
                  })

                  if (result.card_info != undefined) {
                    that.setData({
                      show_modal: {
                        modal_type: 3,
                        text: '恭喜您获得一张卡片',
                        card_name: '“' + common.card_category[result.card_info.card_type] + '”',
                        card_img: common.getCardImg('xl', result.card_info.card_type, 1)
                      }
                    })
                  }

                  wx.hideLoading();
                  wx.hideNavigationBarLoading();
                } else {
                  that.showCustomToast(result.msg);
                }
              }
            })
          },
          fail: function () {
            console.log('获取用户信息失败')
            wx.openSetting({
              success: (res) => {
                /*
                 * res.authSetting = {
                 *   "scope.userInfo": true,
                 *   "scope.userLocation": true
                 * }
                 */
                if (res.authSetting['scope.userInfo']) {
                  that.onLoad({})
                }
              }
            })
          }
        })
      }
    })
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    var that = this

    if (res.from === 'button') {
      var path = '/pages/collect_card_zhuhai/others/others?user_id=' + that.data.user_info.user_id;
      var title = that.data.user_info.nickname + '邀请你帮他收集加油卡片~'
      var req_type = res.target.dataset.req_type
      //1邀请朋友帮忙，2赠送
      if (req_type == 2) {
        //赠送
        var card_id = '';
        if (that.data.card_info_list[that.data.selected.card_type - 1].list.length > 0) {
          card_id = that.data.card_info_list[that.data.selected.card_type - 1].list[0].id;
        }
        path = '/pages/collect_card_zhuhai/index/index?card_id=' + card_id;
        title = that.data.user_info.nickname + '赠送了你一张加油卡片~';
      }

      return {
        title: title,
        path: path,
        imageUrl: common.images.app_cover,
        success: function (res) {
          // 转发成功
          wx.request({
            method: "POST",
            url: common.server_url.get_share_id,
            data: {
              user_info: that.data.user_info,
              flag: req_type,
              invite_card_sub_id: common.invite_card_sub_id,
              get_card_log_id: card_id,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (req_type == 2) {
                that.onLoad({});
                return
              }
              wx.showToast({
                title: '分享成功',
              })
            }
          })
        },
        fail: function (res) {
          // 转发失败
          that.showCustomToast('分享失败');
        }
      }

    }

    //埋点
    var unionid = that.data.user_info.unionid
    wx.request({
      url: common.server_url.save_data,
      data: {
        unionid: unionid,
        click_share: 1,
        invite_card_sub_id: common.invite_card_sub_id
      }
    })

    return {
      title: '集齐卡片，瓜分十万加油金',
      path: '/pages/collect_card_zhuhai/index/index',
      imageUrl: common.images.app_cover,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
        })
      },
      fail: function (res) {
        // 转发失败
        that.showCustomToast('转发失败');
      }
    }
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
              if_submit: result.if_submit,
              ['user_info.user_id']: result.user_id,
            })
            if (result.if_submit == 1) {
              that.showCustomToast('您已提交审核,请耐心等待');
            } else {
              that.setData({
                show_auth: {
                  show_auth: true,
                  show_view: false,
                  view_url_list: result.url,
                },
              })
            }
          } else if (result.flag == 3) {
            that.setData({
              flag: 3,
              ['user_info.user_id']: result.user_id
            })
          }
        } else if (result.ret == 2) {
          that.showCustomToast('请重新刷新页面');
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

  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId
    console.log('formId：', formId)
    if (formId != undefined || formId != '') {
      wx.request({
        url: common.server_url.get_form_id,
        data: {
          user_id: that.data.user_info.user_id,
          form_id: formId,
          invite_card_sub_id: common.invite_card_sub_id
        },
      })
    }
  },

  bindShowImage: function (event) {
    var that = this;
    // console.log(event.currentTarget.dataset.card_type);
    // console.log(event.currentTarget.dataset.card_num);
    var card_type = event.currentTarget.dataset.card_type;
    var card_num = event.currentTarget.dataset.card_num;
    var card_img = common.getCardImg('xl', card_type, card_num);
    that.setData({
      selected: {
        card_type: card_type,
        card_num: card_num,
        card_img: card_img,
      }
    })

    //埋点
    if (card_type == 5 && card_num == 0) {
      var unionid = that.data.user_info.unionid
      wx.request({
        url: common.server_url.save_data,
        data: {
          unionid: unionid,
          if_see_final_card: 1,
          invite_card_sub_id: common.invite_card_sub_id
        }
      })
    }

  },

  /**
   * 点击五菱100%获取此卡片
   */
  bingClickGetCard: function () {
    var that = this;
    that.setData({
      show_modal: {
        modal_type: 1,
        text: '请没有注册易加油专快车/汽油小货车的朋友帮忙收集',
        card_name: '可100%获得此卡片',
        card_img: common.getCardImg('xl', 5, 1)
      }
    })

    //埋点
    var unionid = that.data.user_info.unionid
    wx.request({
      url: common.server_url.save_data,
      data: {
        unionid: unionid,
        if_see_final_card: 2,
        invite_card_sub_id: common.invite_card_sub_id
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
      url: '/pages/collect_card_zhuhai/rule/rule'
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
              flag: 2,
              show_login: false,
              ['user_info.user_id']: result.user_id,
              show_auth: {
                show_auth: true,
                show_view: false,
                view_url_list: result.url
              }
            })
          } else if (result.flag == 2) {
            that.setData({
              if_submit: result.if_submit,
              flag: 2,
            })
            if (result.if_submit == 1) {
              that.showCustomToast('您已提交审核,请耐心等待');
              that.setData({
                show_login: false
              })
            } else {
              that.setData({
                show_login: false,
                show_auth: {
                  show_auth: true,
                  show_view: false,
                  view_url_list: result.url
                }
              })
            }
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
   * 显示身份认证框
   */
  bindShowAuth: function () {
    var that = this
    if (that.data.if_submit == 1) {
      that.showCustomToast('您已提交审核,请耐心等待');
      return
    }
    that.setData({
      ['show_auth.show_auth']: true
    })
  },

  /**
   * 显示提交审核web-view页面，外部页面
   */
  bindShowAuthWebView: function (event) {
    wx.showNavigationBarLoading()
    var car_type = event.currentTarget.dataset.car_type;
    if (car_type == 1) {
      this.setData({
        ['show_auth.show_view']: true,
        ['show_auth.view_url']: this.data.show_auth.view_url_list[0]
      })
    } else {
      this.setData({
        ['show_auth.show_view']: true,
        ['show_auth.view_url']: this.data.show_auth.view_url_list[1]
      })
    }
    setTimeout(function () {
      wx.hideNavigationBarLoading()
    }, 2000)
  },

  /**
   * 隐藏身份认证框
   */
  bindHideAuth: function () {
    this.setData({
      ['show_auth.show_auth']: false
    })
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
    wx.redirectTo({
      url: '/pages/collect_card_zhuhai/index/index'
    })
  },

  /**
   * 埋点
   */
  bindInviteClickCount: function () {
    var that = this
    var unionid = that.data.user_info.unionid
    var click_invite = that.data.flag == 3 ? 1 : 2
    var channel = that.data.flag == 3 && that.data.channel != null ? 1 : 0
    wx.request({
      url: common.server_url.save_data,
      data: {
        unionid: unionid,
        click_invite: click_invite,
        channel: channel,
        invite_card_sub_id: common.invite_card_sub_id
      },
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
   * 拨打客服电话
   */
  bindCallPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '400-8396-555'
    })
  }
})