// pages/collect_card/end/end.js

var common = require('../common/common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unionid: '',
    success: false,
    images: common.images,
    web_view: {
      show_view: false,
      view_url: '',
    },
    collect_info: null,
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
      mask: true,
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
              url: common.server_url.show_activity_end_page,
              data: {
                encrypt_data: res.encryptedData,
                iv: res.iv,
                code: code,
                invite_card_sub_id: common.invite_card_sub_id
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var result = res.data;
                console.log(result);

                //活动结束
                if (result.ret == 0) {

                  that.setData({
                    collect_info: {
                      num: result.num,
                      money: result.money,
                    }
                  })

                  if (result.user_id != 0) {
                    that.setData({
                      success: true,
                      ['web_view.view_url']: common.server_url.query_user_prize + '?userId=' + result.user_id,
                    })
                  }
                  that.setData({
                    unionid: result.unionid
                  })
                  wx.hideLoading();
                  wx.hideNavigationBarLoading();
                }
              }
            })
          }
        })
      }
    })

  },

  /**
   * 跳转到活动规则页面
   */
  bindToRulePage: function () {
    //埋点
    var that = this
    var unionid = that.data.unionid
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
   * 显示查看我的加油金页面，web-view外部页面
   */
  bindShowWebView: function() {
    wx.showNavigationBarLoading()

    this.setData({
      ['web_view.show_view']: true
    })
    
    setTimeout(function () {
      wx.hideNavigationBarLoading()
    }, 2000)
  },

  /**
   * 拨打客服电话
   */
  bindCallPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '400-8396-555'
    })
  },
  
  /**
   * 点击更换图片
   */
  bingClickChangeImg: function (event) {
    var that = this
    var index = event.currentTarget.dataset.index;
    that.setData({
      ['all_img[' + index + ']']: that.data.all_img[2],
      ['all_img[2]']: that.data.all_img[index]
    })
  },
})