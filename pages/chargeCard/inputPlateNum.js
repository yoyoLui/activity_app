// pages/chargeCard/inputPlateNum.js
var app = getApp();
var city = require("../../utils/city.js");
var weApi = require("../../utils/weApi.js");
Page({
  data: {
    pullKeyBoard: true,//拉起键盘
    cityItemSelected: false,//城市被点击
    plateText: '粤',//车牌文本
    plateNumber: '',//号码
    NumIsRight: false,//号是否正确
    plateTextfilled: false,//车牌是否存在
    cityArr: city.city,
    animationData: {},
    currentItemId: '',
    bottom: '',
    gifCardSerial: '',
    openId: '',
    unionId: '',
    autoFocus:false,
    formId:'',//keyboard formId
  },
 
  getUnionId: function (code, res_getUserInfo, gifCardSerial) {
    var that = this;
    var encryptedData = res_getUserInfo.encryptedData;
    var iv = res_getUserInfo.iv;
    //解密出unionId
    app.getUnionId_chargeCard(code, encryptedData, iv, function (res) {
      var openId = res.openId;
      var unionId = res.unionId;
      that.setData({
        gifCardSerial: gifCardSerial,
        openId: res.openId,
        unionId: res.unionId
      });
    })
  },
  onLoad: function (options) {
    var that = this;
    if (options && options.gifCardSerial) {
      //用户授权
      wx.login({
        success: function (res_login) {
          var code = res_login.code;
          wx.getUserInfo({
            withCredentials: true,
            success: function (res_getUserInfo) {
              that.getUnionId(code, res_getUserInfo, options.gifCardSerial);
            },
            fail: function (res) {
              wx.hideLoading();
              weApi.openSettingSuccess(function () {
                wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
                  success: function (res_getUserInfo) {
                    that.getUnionId(code, res_getUserInfo, options.gifCardSerial);
                  },
                });
              });
            }
          })
        }
      })
    }
    that.keyBoardMove(true);
  },
  //键盘的收起和拉起,flag=true拉起
  keyBoardMove: function (openKeyBoard, fun) {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    });
    if (openKeyBoard) {
      this.setData({
        bottom: 'bottom:-472rpx',
        pullKeyBoard: true,
      });
      animation.bottom(0).step();
      this.setData({
        animationData: animation.export()
      });
      if (fun) {
        fun();
      }
    } else {
      this.setData({
        pullKeyBoard: false,
      });
      if (fun) {
        fun();
      }
    }
  },
  selectItemById: function (id, fun) {
    var that = this;
    var cityArr = that.data.cityArr;
    cityArr.forEach(function (obj, i) {
      if (parseInt(obj.id) == parseInt(id)) {
        return fun(obj);
      }
    });
  },
  //点击车牌
  inputPlateFocusFun: function () {
    this.keyBoardMove(true);
  },
  //点击号码
  plateNumFocus: function () {
    var that = this;
    that.keyBoardMove(false);
  },
  //点击城市键盘
  cityItemClick: function (e) {
    var that = this;
    this.setData({
      currentItemId: e.currentTarget.dataset.num
    })
    that.selectItemById(e.currentTarget.id, function (item) {
      that.setData({
        plateText: item.city,
        plateTextfilled: true,
        currentItemId: e.currentTarget.id,
        autoFocus:true
      });
      that.keyBoardMove(false);
    });
  },
  //点击button
  buttonClick: function (res) {
    var that = this;
    if (that.data.plateTextfilled && that.data.NumIsRight) {
      this.getCard(res.detail.formId);
    } else {
      app.showToast('请输入正确的车牌号', this, 2000);
    }
  },
  //获取键盘的formId
  buttonClick2: function (e) {
    console.log(e.detail.formId);
    this.setData({
      formId: e.detail.formId
    });

  },
  //绑定
  getCard: function (formId1) {
    wx.showLoading({
      title: '领取中',
    })
    var that = this;
    var carNum = that.data.plateText + that.data.plateNumber;
    var gifCardSerial = that.data.gifCardSerial;
    var unionId = that.data.unionId;
    var openId = that.data.openId;
    var formId = formId1 +','+ that.data.formId;
    wx.setClipboardData({
      data: formId,
      success: function (res) {
        console.log(JSON.stringify(res));
      }
    });
    app.recharge(carNum, gifCardSerial, unionId, formId, openId, function (code, data) {
      if (code == 200) {//充值成功
        wx.redirectTo({
          url: 'result?type=0&value=' + data.value + '&msg=开着您的爱车' + carNum + '，前往太阳派油站正常消费即可',
        })
      }
      else if (code == 500) {//充值失败,礼品卡已绑定或者不可用
        wx.redirectTo({
          url: 'result?type=' + data.errorType + '&msg=' + data.msg + '&limitDate=' + data.limitDate + '&value=' + data.value,
        })
      }
      else {//充值失败，网络异常或者服务器错误
        wx.redirectTo({
          url: 'result?type=3&msg=' + data,
        })
      }
    });
  },
  //去除空格，非法字符，转换大写
  filterFun: function (str) {
    str = str.replace(/(^\s+)|(\s+$)/g, "");
    str = str.toUpperCase();
    var arr = str.split('');
    var express1 = /^[A-Z]$/;
    var express2 = /^[A-Z0-9]{1}$/;
    var outStr;
    for (var i = 0; i < arr.length; i++) {

      if (i == 0 && !express1.test(arr[i])) {
        arr[i] = '';
      }
      else if (i != 0 && !express2.test(arr[i])) {
        arr[i] = '';
      }
    }
    outStr = arr.join('');
    return outStr;
  },
  //输入车牌号码
  plateNumInput: function (e) {
    var that = this;
    var express = /^[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    var num = that.filterFun(e.detail.value);
    if (num.length > 5) {
      var temp = express.exec(num);
      if (temp) {
        num = temp[0];
        that.setData({
          NumIsRight: true,//号码正确
          plateNumber: num
        });
      } else {
        app.showToast('请输入正确的车牌号', this, 2000);
        that.setData({
          NumIsRight: false
        })
      }
    } else {
      that.setData({
        NumIsRight: false
      })
    }
    return num;
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