//index.js
//获取应用实例
var app = getApp();
Page({
    data: {
        car_type: 0,
        select_zc: "",
        select_yd: "",
        select_sz: "",
        select_zc_image: "https://img.ejiayou.com/wxmp/register/Erefuel_ios9_uploadinfo_regsite_didiexample.png",
        select_yd_image: "https://img.ejiayou.com/wxmp/register/Erefuel_ios9_uploadinfo_regsite_yidaoexample.png",
        select_sz_image: "https://img.ejiayou.com/wxmp/register/Erefuel_ios9_uploadinfo_regsite_shenzhou_example.png",
        select_qiyouhuoche_image1: "https://img.ejiayou.com/wxmp/imgs/pic_firstpage.png",
        select_qiyouhuoche_image2: "https://img.ejiayou.com/wxmp/imgs/pic_secondpage.png",
        select_qiyouhuoche_type: 0,
        select_penal_1: "",
        select_penal_2: "",
        temp_file_path: "",
        canvas_width: 300,
        canvas_height: 200
    },

    //专车等上传页面切换选项设置默认值
    setZhuanCheDataDefult: function(){
        var that = this;
        that.data.select_zc = "";
        that.data.select_yd = "";
        that.data.select_sz = "";
    },
    onLoad: function() {
        var that = this;
        wx.showNavigationBarLoading();
        that.data.car_type = 5;
        that.render();
    },
    onShow: function() {
        var that = this;
        wx.hideNavigationBarLoading();
        wx.hideLoading();
    },

    //选择专车
    selectZc: function(){
        var that = this;
        that.data.car_type = 5;
        that.setZhuanCheDataDefult();
        that.render();
    },

    //选择易到
    selectYd: function(){
        var that = this;
        that.data.car_type = 10;
        that.setZhuanCheDataDefult();
        that.render();
    },

    //选择神州专车
    selectSz: function(){
        var that = this;
        that.data.car_type = 15;
        that.setZhuanCheDataDefult();
        that.render();
    },

    //选择汽油货车图片1
    selectQiyouhuoche1: function(){
        var that = this;
        that.data.select_qiyouhuoche_type = 1;
        that.selectImage();
    },

    //选择汽油货车图片2
    selectQiyouhuoche2: function(){
        var that = this;
        that.data.select_qiyouhuoche_type = 2;
        that.selectImage();
    },

    //选择图片
    selectImage: function(){
        var that = this;
        var sizeType = "compressed";
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: [sizeType], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var temp_file_path = res.tempFilePaths[0];
                that.data.temp_file_path = temp_file_path;
                if(that.data.car_type == 5){
                    that.data.select_zc_image = temp_file_path;
                }
                if(that.data.car_type == 10){
                    that.data.select_yd_image = temp_file_path;
                }
                if(that.data.car_type == 15){
                    that.data.select_sz_image = temp_file_path;
                }
                if(that.data.car_type == 3 || that.data.car_type == 13){
                    if(that.data.select_qiyouhuoche_type == 1){
                        that.data.select_qiyouhuoche_image1 = temp_file_path;
                    }
                    if(that.data.select_qiyouhuoche_type == 2){
                        that.data.select_qiyouhuoche_image2 = temp_file_path;
                    }
                }
                that.render();
            }
        })
    },

    //上传图片
    upload: function(){
        var that = this;
        if(that.data.temp_file_path == ""){
            wx.showModal({
                showCancel: false,
                title: '温馨提示',
                content: "您还没选择图片呢!"
            })
            return;
        }

        if(that.data.loading){
            return;
        }

        that.data.loading = true;
        
        wx.showLoading({
            title: '正在上传'
        })

        setTimeout(function(){
            //提交资料
            wx.request({
                method: "POST",
                url: app.server_api.create_app_data,
                data: app.app_apply_data,
                success: function (res) {
                    console.log("提交资料成功");
                    console.log(res);
                    res = res.data;
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content:"提交资料成功,我们稍候会为您审核",
                        success: function(){
                            
                            wx.redirectTo({
                                url: "../index/index"
                            })

                        }
                    });
                }
            })

        },3000);

    },
    
    //合并图片
    merge: function(){
        var that = this;
        if(that.data.select_qiyouhuoche_image1 == ""){
            wx.showModal({
                showCancel: false,
                title: '温馨提示',
                content: "您还没选择正页图片呢!"
            })
            return;
        }

        if(that.data.select_qiyouhuoche_image2 == ""){
            wx.showModal({
                showCancel: false,
                title: '温馨提示',
                content: "您还没选择副页图片呢!"
            })
            return;
        }

        var ctx = wx.createCanvasContext('merge-canvas');
        ctx.drawImage(that.data.select_qiyouhuoche_image1, 0, 0, that.data.canvas_width, that.data.canvas_height / 2);
        ctx.draw();
        ctx.drawImage(that.data.select_qiyouhuoche_image2, 0, that.data.canvas_height / 2, that.data.canvas_width , that.data.canvas_height / 2);
        ctx.draw();

        wx.canvasToTempFilePath({
            width: that.data.canvas_width,
            height: that.data.canvas_height,
            destWidth: that.data.canvas_width,
            destHeight: that.data.canvas_height,
            canvasId: 'merge-canvas',
            success: function(res) {
                that.data.temp_file_path = res.tempFilePath;
                that.upload();
            },
            fail: function(res){
                wx.showModal({
                    showCancel: false,
                    title: '温馨提示',
                    content: "上传图片失败【001】!"
                })
            }
        })

    },

    //渲染页面
    render: function(){
        var that = this;
        if(that.data.car_type == 5){
            that.data.select_penal_1="select";
            that.data.select_zc="checked";
        }
        if(that.data.car_type == 10){
            that.data.select_penal_1="select";
            that.data.select_yd="checked";
        }
        if(that.data.car_type == 15){
            that.data.select_penal_1="select";
            that.data.select_sz="checked";
        }
        if(that.data.car_type == 3 || that.data.car_type == 13){
            that.data.select_penal_2="select";
        }
        that.setData(that.data);
    }
});
