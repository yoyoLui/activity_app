var md5Utils = require('md5Utils.js')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 统一下单签名算法
 */
function createSign(param,appSecret){
	var signStr = "";
	for(var key in  param){
		var value = param[key];
		if(null != value && value != "" && key != "sign" && key != "key"){
			signStr += key + "=" + param[key] + "&";
		}
	}
	signStr += "key=" + appSecret;
	signStr = md5Utils.md5(signStr).toUpperCase();
	return signStr;
}

/**
 * json转xml
 */
function jsonToXml(json , appendXml){
	var xmlStr = "<xml>";
	for(var key in json){
		xmlStr += "<" + key + ">" + json[key] + "</" + key + ">";
	}

	if(appendXml){
		xmlStr += appendXml;
	}

	xmlStr += "</xml>"
	return xmlStr;
}

/**
 * xml字符串转xml对象
 */
function parseXml(xmlString){
	var xmlDoc=null;
	//判断浏览器的类型
	//支持IE浏览器
	if(!DOMParser && ActiveXObject){ //window.DOMParser 判断是否是非ie浏览器
		var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
		for(var i=0;i<xmlDomVersions.length;i++){
			try{
				xmlDoc = new ActiveXObject(xmlDomVersions[i]);
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
				break;
			}catch(e){
			}
		}
	}
	//支持Mozilla浏览器
	else if(DOMParser){
		try{
		/* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
		* 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
		* parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
		* 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
		*/
		domParser = new DOMParser();
		xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
		}catch(e){
		}
	}
	else{
		return null;
	}
	return xmlDoc;
}

/**
 * xml转json
 */
function xmlToJson(xml , obj) {
	console.log(xml);
   	var json = obj || {};

	if(xml.nodeType == 1){
		json[xml.nodeName] = xml.textContent;
	}
   	if(xml.hasChildNodes()){
	   var children = xml.children;
	   if(children.length > 0 && xml.nodeType == 1){
		   	json[xml.nodeName] = {};
			for(var i = 0 ; i < children.length ; i ++){
				var item = children.item(i);
				var returnJson = xmlToJson(item);
				json[xml.nodeName][item.nodeName] = returnJson[item.nodeName];
			}
	   }else{
		   for(var i = 0 ; i < children.length ; i ++){
				 json = xmlToJson(children.item(i) , json);
			}
	   }
  	}  
   
   return json;
};

module.exports = {
  formatTime: formatTime,
  getInfoByInput : getInfoByInput,
  createSign : createSign,
  jsonToXml : jsonToXml,
  xmlToJson : xmlToJson,
  parseXml : parseXml
}
