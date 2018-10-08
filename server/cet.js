var http = require('http');
var CommonUtils = require('./common.js');

var CETService = {};
module.exports = CETService;

CETService.getCetVerifyByStuId = function(stuid,response){
    var connection = CommonUtils.getConnection();
    var  sql = 'SELECT * FROM cetinfo WHERE stuid ='+stuid;
//查
connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
 
       console.log('--------------------------SELECT----------------------------');
       console.log(result);
    //    response.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
    //    response.end(JSON.stringify(result[0]));
       getverifyByExamnum(result[0].examnum,response);
       console.log('------------------------------------------------------------\n\n'); 

    
    });   
    connection.end();

}


function getverifyByExamnum(examnum,response){
    var url = "http://cache.neea.edu.cn/Imgs.do?c=CET&ik="+examnum+"&t="+Math.random();
    console.log("url:"+url);
    var req = http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
            
            console.log('图片地址:'+html);
            response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
            response.end(JSON.stringify(html));

        });

    });
    req.on('error',function(err){
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
        
    });
    req.end();
}