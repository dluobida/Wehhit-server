var express = require('express');
var app = express();

//使用nodejs自带的http、https模块
var https = require('https');
var http = require('http');
var fs = require('fs');

var http = require('http');
var cheerio = require('cheerio');

//根据项目的路径导入生成的证书文件
 var privateKey  = fs.readFileSync('private.key', 'utf8');
 var certificate = fs.readFileSync('full_chain.pem', 'utf8');
 var credentials = {key: privateKey, cert: certificate};

//创建http与HTTPS服务器
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//可以分别设置http、https的访问端口号
var PORT = 80;
var SSLPORT = 443;

//创建http服务器
httpServer.listen(PORT, function() {
    console.log('HTTP Server is running on: http://localhost:%s', PORT);
});

//创建https服务器
httpsServer.listen(SSLPORT, function() {
     console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
 });
  
//可以根据请求判断是http还是https
app.get('/', function (req, res) {
    if(req.protocol === 'https') {
        res.status(200).send('This is https visit!');
    }
    else {
        res.status(200).send('This is http visit!');
    }
});

app.get('/.well-known/assetlinks.json', function (req, res) {
    
        // res.status(200).json()('This is https visit!');
        res.sendFile( __dirname + "/" + ".well-known/assetlinks.json");
   
});

//根据学号获取考试列表
app.get('/getExamListById/:id', function (req, res) {
    // 1.请求考试信息平台
    var studentId = req.params.id;
    getExamListById(studentId,res);

 });

 //根据考试id获取考试详情
 app.get('/getExamDetailById/:id', function (req, res) {
    // 1.请求考试信息平台
    var examId = req.params.id;
    getExamDetailById(examId,res);

 }); 

 function getExamListById(studentId,response){
    var url = "http://exam.hhit.edu.cn/fgquery.do?status=lowquery&tsid=" + studentId;
    http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
           var examList = [];

            var $ = cheerio.load(html);
            var items = $('#content > div > table > tbody > tr:nth-child(2) > td > table > tbody')
                          .children('.trclick');
            console.log("length="+items.length);
            //循环items
            items.each(function(index,elem){
                var exam = {};
                var detailUrl = $(this).attr('onclick').replace("window.open('/fgquery.do?status=examdetail&examid=",'');
                var examid = detailUrl.replace("')",'');
                exam.examid = examid;
                var examItems = $(this).children('td');
                // console.log('examid:'+examid +"===="+examItems.length);
                //循环examItems
                examItems.each(function(i,e){
                    var value = $(this).text().trim();
                    switch (i){
                        case 0:
                        exam.num = value;
                        break;
                        case 1:
                        exam.subject = value;
                        break;
                        case 2:
                        exam.date = value.split(" ")[0];
                        break;
                        case 3:
                        exam.time = value;
                        break;
                        case 4:
                        exam.class = value;
                        break;
                        case 5:
                        exam.address = value;
                        break;
                        case 6:
                        exam.teacher = value;
                        break;
                    }


                });
                examList.push(exam);
                

            });

            console.log("最终的考试列表结果:"+ JSON.stringify(examList));
            response.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            response.end(JSON.stringify(examList));
            

        });
    });
 }


 function getExamDetailById(examId,response){
    var url = "http://exam.hhit.edu.cn/fgquery.do?status=examdetail&examid=" + examId;
    http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
           var examList = [];
           var examDetail = {};

            var $ = cheerio.load(html);
            var items = $('#content > div > table > tbody > tr:nth-child(2) > td > table > tbody')
                          .children('tr');
            console.log("length="+items.length);
            //循环items
            items.each(function(index,elem){
                var exam = {};
                var detailItems = $(this).children('td');
                // console.log('examid:'+examid +"===="+examItems.length);
                //循环examItems
                detailItems.each(function(index,element){
                    if(index % 2 != 0 ){
                        examList.push($(this).text().trim());
                    }
                    
                });
            });

            examDetail.term = examList[0];
            examDetail.date = examList[1].split(" ")[0];
            examDetail.address = examList[2];
            examDetail.time = examList[3];
            examDetail.subject = examList[4];
            examDetail.class = examList[5];
            examDetail.teacher = examList[6];
            examDetail.category = examList[7];
            examDetail.number = examList[8];
            examDetail.form = examList[9];


            console.log("最终的考试列表结果:"+ JSON.stringify(examDetail));

            response.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            response.end(JSON.stringify(examDetail));

        });
    });
 }
 


