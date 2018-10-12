var CommonUtils = require('./server/common.js');
var xlsx = require('node-xlsx'); 
var fs = require('fs');



//1.读取excel数据

//读取文件内容
var obj = xlsx.parse('cet.xlsx');
var excelObj = obj[0].data; 
// console.log(excelObj);
var data = []; 
for (var i in excelObj) {
  var arr = []; 
  var value = excelObj[i];
  for (var j in value) { 
    arr.push(value[j]); 
  }
   data.push(arr);
}

console.log(data);

//2.将数据插入数据库中
var connection = CommonUtils.getConnection();
var  sql = 'INSERT INTO cetinfo (id,examnum,name,sex,stuid) VALUES ?';
connection.query(sql,[data],function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
 
       console.log('--------------------------SELECT----------------------------');
       console.log(result);
       console.log('------------------------------------------------------------\n\n'); 

    
    });   
    connection.end();