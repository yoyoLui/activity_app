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

  onLoad: function (opt) {
   
    //如果曾经打开过集卡页面，则跳转集卡页面
    try {
      var value = wx.getStorageSync('collectCard');
      console.log(value);
      if (value != "") {
        wx.redirectTo({
          url: value,
        })
        return;
      }
    } catch (e) {
      console.log('no storage');
    }
   


    //开关
    // opt.from_source = 3;//输入车牌号领200礼品卡
    // opt.card_serial = '99fc0d9bb1b711e787d400163e0014c7';
    console.log('index option=' + JSON.stringify(opt));
    var options;
    var that = this;
    if (JSON.stringify(opt) == "{}" && app.options) {
      options = app.options;
    } else {
      options = opt;
    }
    that.judgeToRedirect(options);
  },

  judgeToRedirect: function (options) {
    app.options = options;
    console.log('judgeToRedirect options=' + JSON.stringify(options));
    var that = this;
    if (undefined != options && undefined != options.from_source) {
      if (options.from_source == 3 && options.card_serial) {//输入车牌号领礼品卡
        that.toChargeCard(options.card_serial);
      }
      return;
    } //进入首页
    else {
      that.setData({
        is_index: true
      });


    }
  },
  toChargeCard: function (gifCardSerial) {
    wx.showLoading({
      title: '加载中',
    })
    app.initView_chargeCard(gifCardSerial, function (res_init) {
      if (typeof res_init == 'string') {//网络开小差
        wx.redirectTo({
          url: '../chargeCard/result?type=3&msg=' + res_init,
        })
      } else {
        if (res_init.canUse) {//礼品卡可用，并且未绑定
          wx.redirectTo({
            url: "../chargeCard/inputPlateNum?gifCardSerial=" + gifCardSerial,
          })
        } else {//礼品卡不可用
          wx.redirectTo({
            url: '../chargeCard/result?type=' + res_init.errorType + '&msg=' + res_init.msg + '&limitDate=' + res_init.limitDate + '&value=' + res_init.value,
          })

        }
      }

    })
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


  onShow: function () {
    wx.hideLoading();
  }
})