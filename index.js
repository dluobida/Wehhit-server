var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

//使用nodejs自带的http、https模块
var https = require('https');
var http = require('http');
var fs = require('fs');

var ExamArrange = require('./server/examArrange.js');
var ReadService = require('./server/read.js');
var ComputerService = require('./server/computer.js');
var PthService = require('./server/putonghua.js');
var CETService = require('./server/cet.js');
var ZFService = require('./server/zf.js');

//根据项目的路径导入生成的证书文件
 var privateKey  = fs.readFileSync('private.key', 'utf8');
 var certificate = fs.readFileSync('full_chain.pem', 'utf8');
 var credentials = {key: privateKey, cert: certificate};

//创建http与HTTPS服务器
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//可以分别设置http、https的访问端口号
var PORT = 8011;
var SSLPORT = 443;

//创建http服务器
httpServer.listen(PORT, function() {
    console.log('HTTP Server is running on: http://localhost:%s', PORT);
});

//创建https服务器
// httpsServer.listen(SSLPORT, function() {
//      console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
//  });
  
//可以根据请求判断是http还是https
app.get('/', function (req, res) {
    if(req.protocol === 'https') {
        res.status(200).send('This is https visit!');
    }
    else {
        res.status(200).send('This is http visit!');
    }
});

// app.get('/.well-known/assetlinks.json', function (req, res) {
    
//         // res.status(200).json()('This is https visit!');
//         res.sendFile( __dirname + "/" + ".well-known/assetlinks.json");
   
// });

//根据学号获取考试列表
app.get('/getExamListById/:id', function (req, res) {
    // 1.请求考试信息平台
    var studentId = req.params.id;
    ExamArrange.getExamListById(studentId,res);

 });

 //根据考试id获取考试详情
 app.get('/getExamDetailById/:id', function (req, res) {
    // 1.请求考试信息平台
    var examId = req.params.id;
    ExamArrange.getExamDetailById(examId,res);

 }); 

 app.get('/getExamListByCondition', function (req, res) {
    // 1.请求考试信息平台
    
    var examType = (req.query.examType == undefined) ? "" : req.query.examType;
    var academic = (req.query.academic == undefined) ? "" : req.query.academic;
    var courseName = (req.query.courseName == undefined) ? "" : req.query.courseName;
    var startExamDate = (req.query.startExamDate == undefined) ? "" : req.query.startExamDate;
    var endExamDate = (req.query.endExamDate == undefined) ? "" : req.query.endExamDate;
    var startTime = (req.query.startTime == undefined) ? "" : req.query.startTime;
    var endTime = (req.query.endTime == undefined) ? "" : req.query.endTime;
    var examUnit = (req.query.examUnit == undefined) ? "" : req.query.examUnit;
    var instituteid = (req.query.instituteid == undefined) ? "" : req.query.instituteid;
    var arrangeInstitute = (req.query.arrangeInstitute == undefined) ? "" : req.query.arrangeInstitute;
    var pagenow = (req.query.pagenow == undefined) ? 1 : req.query.pagenow;

    ExamArrange.getExgetExamListByCondition(examType,
                               academic,
                               courseName,
                               startExamDate,
                               endExamDate,
                               startTime,
                               endTime,
                               examUnit,
                               instituteid,
                               arrangeInstitute,
                               pagenow,
                               res);
 
 }); 

//获取每日一文
 app.get('/getReadDetailByDate/:date', function (req, res) {
    // 1.请求考试信息平台
    var date = req.params.date;
    ReadService.getReadDetailByDate(date,res);

 }); 

 //根据学号获取CET准考证
 app.get('/getCetExamnumByStuId/:stuid', function (req, res) {
    // 1.请求考试信息平台
    var stuid = req.params.stuid;
    CETService.getCetVerifyByStuId(stuid,res);

 }); 

 //根据学号获取计算机成绩
 app.get('/getComputerScoresByStuId/:stuid', function (req, res) {
    // 1.请求考试信息平台
    var stuid = req.params.stuid;
    ComputerService.getComputerScoresByStuId(stuid,res);

 }); 

 //根据学号获取普通话成绩
 app.get('/getPthScoresByStuId/:stuid', function (req, res) {
    // 1.请求考试信息平台
    var stuid = req.params.stuid;
    PthService.getPthScoresByStuId(stuid,res);

 }); 

 app.get('/getZFState', function (req, res) {
      ZFService.getZFState(res);

 }); 

 app.post('/zfLogin',urlencodedParser, function (req, res) {
    var  data = {
        "stateValue":req.body.stateValue,
        "txtUserName":req.body.txtUserName,
        "password":req.body.password,
        "verifyCode":req.body.verifyCode,
        "RadioButtonList1":"学生",
        "randomUrl":req.body.randomUrl

    }
   console.log("data请求："+ JSON.stringify(data));

   ZFService.login(data,res);

}); 

//返回验证码
app.get('/getCheckCode/:randomUrl', function (req, res) {
    // 1.请求考试信息平台
    var randomUrl = req.params.randomUrl;
    var realUrl = 'http://zfxk.hhit.edu.cn/' + randomUrl+'/CheckCode.aspx'
    console.log("realUrl:"+realUrl);
    res.redirect(encodeURI(realUrl));

 }); 




 


