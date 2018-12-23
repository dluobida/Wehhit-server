var http = require('http');
var cheerio = require('cheerio');
var Q = require('q');
var querystring = require('querystring');
var iconv = require("iconv-lite");

var encoding = require('encoding');

var CommonUtils = require('./common.js');
var ZF = {};
module.exports = ZF;

ZF.getZFState = function(response) {
    
    loginStep1()
    .then(function(result){
        return loginStep2(result);
    })
    .then(function(result){
        //返回登录界面
        // response.sendFile(__dirname +'/'+'web/zfLogin.html');
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end(JSON.stringify(result));
    })
    .then(null, function(error){
        console.log("链式流程产生的错误:"+error);
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
    });
}


ZF.login = function(data,response){
    zfLogin(data)
    .then(function(result){
        if(result.status == 'success'){
           //跳转界面，拿到5个子菜单跳转地址
           return goToMain(result.movedToUrl);
        }else{
            response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
            response.end(JSON.stringify(result)); 
        }
    })
    // .then(function(result){
    //     return getContent("/"+result.randomUrl);

    // })
    .then(function(result){
        var randomUrl = result.randomUrl;
        var url = result.datas[1].url;
        var totalUrl = result.url;

        // var contentUrl = "/" + randomUrl + "/" + 'xscj_gc.aspx?xh=2016124174&xm=%D3%DA%C2%BD%C2%BD&gnmkdm=N121605';
        var contentUrl = "/" + randomUrl + "/" + url;
        return getXSCJState(randomUrl,contentUrl,totalUrl);
    })
    .then(function(result){
        return getSocres(result);
    })
    .then(function(result){
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end(JSON.stringify(result));
    })
    .then(null, function(error){
        console.log("链式流程产生的错误:"+error);
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
    });



}


function loginStep1() {
    var defer=Q.defer();
    var url = CommonUtils.getZFBaseUrl() + "/default2.aspx";
    var req = http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {

            // console.log("登录界面:"+ html);
            //获取值
            var $ = cheerio.load(html);
            var newUrl = $('a').attr('href');
            // console.log('newUrl:'+newUrl);
            defer.resolve(newUrl);
        });
    });

    req.on('error',function(err){
        defer.reject(error);
    });
    req.end();

    return defer.promise;



}

function loginStep2(newUrl) {
    var defer=Q.defer();
    var url = CommonUtils.getZFBaseUrl() + newUrl;
    var req = http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {

            // console.log("登录界面:"+ html);
            //获取值
            var $ = cheerio.load(html);
            var stateValue = $('#form1 > input[type="hidden"]').val();
            var obj = new Object();
            var randomUrl = newUrl.replace("/default2.aspx","");
            // console.log("randomUrl:"+randomUrl);
            obj.url = randomUrl;
            obj.stateValue = stateValue;
            defer.resolve(obj);
        });
    });

    req.on('error',function(err){
        defer.reject(err);
    });
    req.end();

    return defer.promise;



}

function zfLogin(reqData) {
    var defer=Q.defer();
    var postData = querystring.stringify({
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

    });
    var options = {
        hostname: 'zfxk.hhit.edu.cn',
        port: 80,
        path: reqData.randomUrl+'/default2.aspx',
        method: 'POST',
        headers: {
            //'Content-Type':'application/x-www-form-urlencoded',  
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData)
        }
    }

    console.log("path:"+options.path);
    var req = http.request(options, function (res) {
        // console.log('Status:', res.statusCode);
        // console.log('headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var html = '';
        res.on('data', function (data) {
            html += data;
        });
        res.on('end', function () {
            // console.log("返回结果:" + html);
            var obj = {};
            if(res.statusCode == 302){
                var $ = cheerio.load(html);
                var movedToUrl = $('h2 a').attr("href");
                // console.log("movedToUrl:"+movedToUrl);
                obj.status = 'success';
                obj.movedToUrl = movedToUrl;
                defer.resolve(obj);
            }else if(res.statusCode == 200){
                obj.status = 'fail';
                obj.reason = html.indexOf('��֤�벻��ȷ����') > 0 ? "验证码不正确":"密码错误，如忘记密码，请与教务处联系!";
                // console.log("reason:"+ obj.reason);
                defer.resolve(obj);
            }else{
                obj.status = 'maintain'
                defer.resolve(obj);
            }

            
            
        });
    });
    req.on('error', function (err) {
        console.error(err);
        defer.reject(err);
    });
    req.write(postData);
    req.end();

    return defer.promise;

}

function goToMain(mainUrl) {
    var defer = Q.defer();
    var url = CommonUtils.getZFBaseUrl() + mainUrl;
    // console.log("mainUrl:"+url);
    var req = http.get(encodeURI(url), function (req, res) {
        // var html = '';
        var arrBuf = [];
        var bufLength = 0;
        req.on('data', function (data) {
            // html += data;
            arrBuf.push(data);
            bufLength += data.length;
        });
        req.on('end', function () {

            // console.log("登录界面:"+ html);
            var datas = [];
            //获取值
            var chunkAll = Buffer.concat(arrBuf, bufLength);
            var html = iconv.decode(chunkAll,'gb2312'); // 汉字不乱码
            var $ = cheerio.load(html);
            var items = $('#headDiv > ul > li:nth-child(5) > ul').find('a');
            //循环items
            items.each(function (index, elem) {
                var item = {};
                item.name = $(this).text();
                item.url = $(this).attr("href");
                // console.log("menu:"+JSON.stringify(item));
                datas.push(item);
                
                
            });

            var result = {};
            result.randomUrl = mainUrl.split("/")[1];
            result.datas = datas;
            result.url = url;
            // console.log("randomUrl:"+result.randomUrl);
            defer.resolve(result);


            
        });
    });

    req.on('error', function (err) {
        defer.reject(err);
    });
    req.end();

    return defer.promise;
}

function getContent(contentUrl){
    var defer = Q.defer();
    var url = CommonUtils.getZFBaseUrl() + contentUrl + "/content.aspx";
    // console.log("contentUrl:"+encodeURI(url));
    var req = http.get(encodeURI(url), function (req, res) {
        // var html = '';
        var arrBuf = [];
        var bufLength = 0;
        req.on('data', function (data) {
            // html += data;
            arrBuf.push(data);
            bufLength += data.length;
        });
        req.on('end', function () {

            // console.log("登录界面:"+ html);
            var datas = [];
            //获取值
            var chunkAll = Buffer.concat(arrBuf, bufLength);
            var html = iconv.decode(chunkAll,'gb2312'); // 汉字不乱码
            var $ = cheerio.load(html);
            // console.log("getXSCJState:"+html);
        
            defer.resolve(contentUrl);


            
        });
    });

    req.on('error', function (err) {
        defer.reject(err);
    });
    req.end();

    return defer.promise;

}

function getXSCJState(randomUrl,contentUrl,totalUrl){
    var defer = Q.defer();
    // var contentUrl = "/" + randomUrl + "/" + 'xscj_gc.aspx?xh=2016124174&xm=%D3%DA%C2%BD%C2%BD&gnmkdm=N121605';
    var url = CommonUtils.getZFBaseUrl() + contentUrl;
    // console.log("contentUrl:"+url);
    var options = {
        hostname: 'zfxk.hhit.edu.cn',
        port: 80,
        path: contentUrl,
        method: 'GET',
        headers: {
            //'Content-Type':'application/x-www-form-urlencoded',  
            'Referer': totalUrl,
            'Host': 'zfxk.hhit.edu.cn'
        }
    }
    var req = http.get(options, function (req, res) {
        // var html = '';
        var arrBuf = [];
        var bufLength = 0;
        req.on('data', function (data) {
            // html += data;
            arrBuf.push(data);
            bufLength += data.length;
        });
        req.on('end', function () {

            // console.log("登录界面:"+ html);
            var datas = [];
            //获取值
            var chunkAll = Buffer.concat(arrBuf, bufLength);
            var html = iconv.decode(chunkAll,'gb2312'); // 汉字不乱码
            var $ = cheerio.load(html);
            // console.log("getXSCJState:"+html);
            // var stateValue = $('#form1 > input[type="hidden"]').val();
            var xscjState = $('#Form1 > input[type="hidden"]').val();
            var result = {};
            result.contentUrl = contentUrl;
            result.xscjState = xscjState;
            // console.log("xscjState:"+xscjState);
            defer.resolve(result);


            
        });
    });

    req.on('error', function (err) {
        defer.reject(err);
    });
    req.end();

    return defer.promise;

}


function getSocres(params){
    var randomUrl = params.randomUrl;
    var contentUrl = params.contentUrl;
    var xscjState = params.xscjState;

    var defer=Q.defer();
    var postData = querystring.stringify({
        "__VIEWSTATE":xscjState,
        "ddlXN":'',
        "ddlXQ":'',
        "Button2":'%D4%DA%D0%A3%D1%A7%CF%B0%B3%C9%BC%A8%B2%E9%D1%AF'

    });
    // var contentUrl = "/" + randomUrl + "/" + 'xscj_gc.aspx?xh=2016124174&xm=%D3%DA%C2%BD%C2%BD&gnmkdm=N121605';
    var options = {
        hostname: 'zfxk.hhit.edu.cn',
        port: 80,
        path: contentUrl,
        method: 'POST',
        headers: {
            //'Content-Type':'application/x-www-form-urlencoded',  
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData),
            'Referer': encodeURI('http://zfxk.hhit.edu.cn'+contentUrl),
            'Host': 'zfxk.hhit.edu.cn'
        }
    }

    // console.log("path:"+options.path);
    var req = http.request(options, function (res) {
        // console.log('Status:', res.statusCode);
        // console.log('headers:', JSON.stringify(res.headers));
        // var html = '';
        var arrBuf = [];
        var bufLength = 0;
        res.on('data', function (data) {
            // html += data;
            arrBuf.push(data);
            bufLength += data.length;
        });
        res.on('end', function () {
            
            var chunkAll = Buffer.concat(arrBuf, bufLength);
            var html = iconv.decode(chunkAll,'gb2312'); // 汉字不乱码
            // console.log("返回结果:" + html);
            var catag = [];
            var scores = [];
            var $ = cheerio.load(html);
            var items = $('#Datagrid1 > tbody').children("tr");
            items.each(function (index, element) {
                if(index == 0){
                    $(this).children("td").each(function(i,e){
                        catag.push($(this).text());
                        
                    });
                }else{
                    var score = [];
                    $(this).children("td").each(function(i,e){
                        
                        score.push($(this).text());
                        
                    });
                    scores.push(score);
                }
                });
            
            // var name = $('#Datagrid1 > tbody > tr:nth-child(2) > td:nth-child(4)').text();
            var result = {};
            result.status = "success";
            result.catag = catag;
            result.scores = scores.reverse();
            // console.log("catag:"+result.scores[0]);
            defer.resolve(result);
            

            
            
        });
    });
    req.on('error', function (err) {
        console.error(err);
        defer.reject(err);
    });
    req.write(postData);
    req.end();

    return defer.promise;


}