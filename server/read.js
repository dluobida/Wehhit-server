var CommonUtils = require('./common.js');
var ReadService = {};
module.exports = ReadService;

ReadService.getReadDetailByDate = function(date,response){
    var connection = CommonUtils.getConnection();
    var  sql = 'SELECT * FROM article WHERE prevent ='+date;
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
       console.log('------------------------------------------------------------\n\n'); 

    
    });   
    connection.end();
}
