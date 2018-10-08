var CommonUtils = require('../server/common.js');
var excelParser = require('excel-parser');


//1.读取excel数据
excelParser.worksheets({
  inFile: 'cetscores.xls'
}, function(err, worksheets){
  if(err) console.error(err);
  consol.log(worksheets);
});

//2.将数据插入数据库中