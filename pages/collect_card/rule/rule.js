// pages/collect_card/rule/rule.js
var common = require('../common/common.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    time_str: '',
    rule_list: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this

    wx.request({
      url: common.server_url.get_rule,
      data: {
        invite_card_sub_id: 1
      },
      method: 'POST',
      success: function(res) {
        var result = res.data
        console.log(result)
        if (result.ret == 0) {
          that.setData({
            time_str: result.time_str,
            rule_list: result.str_arr
          })
        }else{

        }
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      }
    })

  },
})