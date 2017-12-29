
var img_url = 'https://img.ejiayou.com/imgs/activity/images/invite_card/'

// var host = 'https://dev.ejiayou.com'
var host = 'https://yifenshe.top'
var pre_url = '/activity/invite_get_card'

var server_url = {
  //活动内部链接--小程序集卡拉新活动
  index: host + pre_url + '/index',
  get_share_id: host + pre_url + '/get_share_id',
  get_form_id: host + pre_url + '/get_form_id',
  get_verification_code: host + pre_url + '/get_verification_code',
  get_user_info_by_phone: host + pre_url + '/get_user_info_by_phone',
  get_card: host + pre_url + '/get_card',
  show_activity_end_page: host + pre_url + '/show_activity_end_page',
  save_register_log: host + pre_url + '/save_register_log',
  get_user_phone: host + pre_url + '/get_user_phone',
  get_rule: host + pre_url + '/get_rule',

  //数据埋点
  save_data: host + pre_url + '/save_data',
  
  //活动外部链接--查看加油金
  query_user_prize: host + '/wxmp/view/queryUserPrize.ac',

}

var card_category = {
  "1": "福特", "2": "大众", "3": "解放", "4": "奔驰", "5": "五菱"
};
var text_category = {
  "1": "text_ft", "2": "text_dz", "3": "text_jf", "4": "text_bc", "5": "text_wl"
};

var images = {
  card_xl_colour_ft: img_url + 'card_xl_colour_ft.png',
  card_xl_colour_dz: img_url + 'card_xl_colour_dz.png',
  card_xl_colour_jf: img_url + 'card_xl_colour_jf.png',
  card_xl_colour_bc: img_url + 'card_xl_colour_bc.png',
  card_xl_colour_wl: img_url + 'card_xl_colour_wl.png',

  card_xl_grey_ft: img_url + 'card_xl_grey_ft.png',
  card_xl_grey_dz: img_url + 'card_xl_grey_dz.png',
  card_xl_grey_jf: img_url + 'card_xl_grey_jf.png',
  card_xl_grey_bc: img_url + 'card_xl_grey_bc.png',
  card_xl_grey_wl: img_url + 'card_xl_grey_wl.png',

  card_sm_colour_ft: img_url + 'card_sm_colour_ft.png',
  card_sm_colour_dz: img_url + 'card_sm_colour_dz.png',
  card_sm_colour_jf: img_url + 'card_sm_colour_jf.png',
  card_sm_colour_bc: img_url + 'card_sm_colour_bc.png',
  card_sm_colour_wl: img_url + 'card_sm_colour_wl.png',

  card_sm_grey_ft: img_url + 'card_sm_grey_ft.png',
  card_sm_grey_dz: img_url + 'card_sm_grey_dz.png',
  card_sm_grey_jf: img_url + 'card_sm_grey_jf.png',
  card_sm_grey_bc: img_url + 'card_sm_grey_bc.png',
  card_sm_grey_wl: img_url + 'card_sm_grey_wl.png',

  text_ft: img_url + 'text_ft.png',
  text_dz: img_url + 'text_dz.png',
  text_jf: img_url + 'text_jf.png',
  text_bc: img_url + 'text_bc.png',
  text_wl: img_url + 'text_wl.png',

  click_get_card: img_url + 'click_get.png',

  app_cover: img_url + 'app_cover.png',

  default_head_img: img_url + 'default_head_img.png',

  pic_logo: img_url + 'pic_logo.png',

  close_btn: img_url + 'close_btn.png',

  arrow: img_url + 'arrow.png',
}

function getCardImg(card_size, card_type, card_num) {

  var image_name = 'card_';

  if (card_size == 'xl') {
    image_name += 'xl_';
  } else {
    image_name += 'sm_';
  }

  if (card_num > 0) {
    image_name += 'colour_';
  } else {
    image_name += 'grey_';
  }

  switch (card_type) {
    case 1:
      image_name += 'ft';
      break;
    case 2:
      image_name += 'dz';
      break;
    case 3:
      image_name += 'jf';
      break;
    case 4:
      image_name += 'bc';
      break;
    case 5:
      image_name += 'wl';
      break;
  }
  return images[image_name];
}

function checkMobile(phone){
  return (/^1[0-9][0-9]\d{8}$/.test(phone));
}

module.exports.getCardImg = getCardImg
module.exports.images = images
module.exports.server_url = server_url

module.exports.card_category = card_category
module.exports.text_category = text_category

module.exports.checkMobile = checkMobile
