// pages/collect_card_chengdu/station/station.js
Page({

  data: {
    station_lists: [],
  },
  onLoad: function () {
    var that = this;

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.request({
          method: "POST",
          url: 'https://yifenshe.top/activity/invite_1/service/wx/stations/get',
          data: {
            longitude: longitude,
            latitude: latitude
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            var result = res.data;
            if (result.ret != 0) {
              wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
              });
              return;
            }
            that.setData({
              station_lists: result.stations
            });
            wx.hideLoading();
            wx.hideNavigationBarLoading();
          },
          fail: function (res) {
            wx.showToast({
              title: '加载失败',
              icon: 'loading',
              duration: 2000
            });
            console.log(res);
          }
        })
      }
    })

  }
})