var CommonUtils = {};
module.exports = CommonUtils;

var mysql  = require('mysql');

CommonUtils.getConnection = function(){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'abc123@comic',
        database : 'wehhit'
      });
       
      connection.connect();

      return connection;

}

