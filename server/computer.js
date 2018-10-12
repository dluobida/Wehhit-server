var http = require('http');
var CommonUtils = require('./common.js');

var ComputerService = {};
module.exports = ComputerService;

ComputerService.getComputerScoresByStuId = function(stuid,response){
    var connection = CommonUtils.getConnection();
    var  sql = 'SELECT * FROM computer WHERE stuid ='+stuid;
//查
connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
 
       console.log('--------------------------SELECT----------------------------');
       console.log(result);
       response.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
       response.end(JSON.stringify(result[0]));
    //    getverifyByExamnum(result[0].examnum,response);
       console.log('------------------------------------------------------------\n\n'); 

    
    });   
    connection.end();

}