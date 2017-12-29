// pages/chargeCard/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    charge_title: "",
    charge_text: '',
    limitDate:'',
    value: '',
    isLight: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //type=0成功，=1礼品卡过期，=2礼品卡不可用,=3服务器错误
    if (options && options.type && options.msg) {
      if (parseInt(options.type) == 0) {//成功
        that.setData({
          charge_title: '充值成功！',
          charge_text: options.msg,
          value: parseInt( options.value),
          isLight:true
        });
      }
      if (parseInt(options.type) == 1) {//礼品卡过期
        that.setData({
          charge_title: '充值失败',
          charge_text: options.msg,
          limitDate: options.limitDate,
          value: parseInt(options.value),
          isLight: false
        });
      }
      if (parseInt(options.type) == 2) {//礼品卡已经绑定
        that.setData({
          charge_title: '充值失败',
          charge_text: options.msg,
          value: parseInt(options.value),
          isLight: false
        });
      }
      if (parseInt(options.type) == 3) {//服务器错误或者网络异常
        that.setData({
          charge_title: '充值失败',
          charge_text: options.msg,
          isLight: false
        });
      }
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideLoading();
    wx.hideToast();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})