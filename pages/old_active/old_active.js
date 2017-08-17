// pages/new_index/new_index.js
var app = getApp();
Page({
  data: {
    station_list: '',
    ticketGroup: '',
  },
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    app.getTicket(app.user_info_data._k, function () {
      wx.hideLoading();
      that.data.ticketGroup = app.old_active_data.ticketGroup;
      that.setData(that.data);
      console.log('app.old_active_data.getTicketMsg=' + app.old_active_data.getTicketMsg);
      app.showToast(app.old_active_data.getTicketMsg, that, 2500);
    });
    app.getStation(function () {
      that.data.station_list = app.old_active_data.stationData;
      that.setData(that.data);
    });
  },
  toAchive: function (e) {
    //正常激活
    wx.showLoading({ title: '加载中' })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})