var request = require('request');
var Q = require('q');
var cheerio = require('cheerio');


var CommonUtils = require('./common.js');
var ZFService = {}
module.exports = ZFService;

var debug = true;

var headers = {
    // 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
    // 'Cookie': 'ASP.NET_SessionId=3bzzgi453jwznq45i2c4xs45'
    'Cookie': 'ASP.NET_SessionId=muaodh55bdtgqjnixntbis55'
};

ZFService.getLogin = function(response){
    // getSync("http://zf.hhit.edu.cn/default2.aspx")
    zfLogin()
    .then(function(result){
        //获取status
        var $ = cheerio.load(result);
        var stateValue = $('#form1 > input[type="hidden"]').val();
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end(stateValue);

    })
    .then(null, function(error){
        console.log("链式流程产生的错误:"+error);
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
    });
}


ZFService.login = function(reqData,response){
    var postData = {
        "__VIEWSTATE":reqData.stateValue,
        "txtUserName":reqData.txtUserName,
        "Textbox1":'',
        "TextBox2":reqData.password,
        "txtSecretCode":reqData.verifyCode,
        "RadioButtonList1":"%D1%A7%C9%FA",
        "Button1":'',
        "lbLanguage":'',
        "hidPdrs":'',
        "hidsc":''

    };
    postSync("http://zf.hhit.edu.cn/default2.aspx",postData);
    response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    response.end(JSON.stringify("ok"));


}

	
function zfLogin(){
    var defer=Q.defer();
    var options = {
        url:"http://zf.hhit.edu.cn/default2.aspx",
        method:"GET",
        headers:headers,
        proxy:"http://127.0.0.1:8888"
    };
	
    request.get(options, function (error, response, body) {
                console.log('请求回调接口zfLogin');
                if (!error) {
                    var result = body;
                    console.log("cookie:"+response.headers['set-cookie']) // 请求成功的处理逻辑
                    defer.resolve(result);	
                }else {
                    console.log('请求失败！') // 请求成功的处理逻辑
                    defer.reject(error);
                }
      });
    return defer.promise;


}

	
function getSync(url){
		var defer=Q.defer();		
		request.get({url:url, 
			     proxy: "http://127.0.0.1:8888" }, function (error, response, body) {
					console.log('请求回调接口getSync');
					if (!error) {
						var result = body;
						console.log(result) // 请求成功的处理逻辑
						defer.resolve(result);	
					}else {
						console.log('请求失败！') // 请求成功的处理逻辑
						defer.reject(error);
					}
		  });
		return defer.promise;
	}
	

	
function postSync(url, data){
		var defer=Q.defer();
		if(debug){
		console.log("POST",url);
		console.log("POST BODY:");
		console.log(data);
		}
		var result ;
		var url=url;
		var requestData = data;
		request.post({url:url, 
                      form:requestData,
                      headers:headers,
					  proxy: "http://127.0.0.1:8888" }, function(error, response, body) {
			console.log('请求回调接口postSync');
			if (!error) {
				var result = body;
				console.log(result) // 请求成功的处理逻辑
				defer.resolve(result);
				
			}else {
                console.log('请求失败！') // 请求成功的处理逻辑
				defer.reject(error);
			}
			
		});
		return defer.promise;
		
	}
	
function postSync2(url, data){
		var defer=Q.defer();
		if(debug){
		console.log("POST",url);
		console.log("POST BODY:");
		console.log(data);
		}
		var result ;
		var url=url;
		var requestData = data;
		request({
			url: url,
			method: "POST",
			json: true,
			headers: {
				"content-type": "application/json",
			},
			proxy: "http://127.0.0.1:8888",
			body: requestData
		}, function(error, response, body) {
			console.log('请求回调接口postSync2');
			if (!error && response.statusCode == 200) {
				var result = body;
				console.log(result) // 请求成功的处理逻辑
				if(result.success){
					defer.resolve(result);
				}else {
					console.log("业务错误："+result.msg);
					defer.reject(result.msg);
				}
			}else {
                console.log('请求失败！') // 请求成功的处理逻辑
				defer.reject(error);
			}
			
		}); 
		return defer.promise;
	}

	


	

	

