const http = require('https');
var mysql = require('mysql');

var chooseDate = [];
var num = 0;



Date.prototype.format = function() {  
    var s = '';  
    var mouth = (this.getMonth() + 1)>=10?(this.getMonth() + 1):('0'+(this.getMonth() + 1));  
    var day = this.getDate()>=10?this.getDate():('0'+this.getDate());  
    s += this.getFullYear() ; // 获取年份。  
    s += mouth ; // 获取月份。  
    s += day; // 获取日。  
    return (s); // 返回日期。  
};  

function getAll(begin, end) {  
    var ab = begin.split("-");  
    var ae = end.split("-");  
    var db = new Date();  
    db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);  
    var de = new Date();  
    de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);  
    var unixDb = db.getTime();  
    var unixDe = de.getTime();  
    for (var k = unixDb; k < unixDe;) {  
        chooseDate.push((new Date(parseInt(k))).format());
        console.log((new Date(parseInt(k))).format());  
        k = k + 24 * 60 * 60 * 1000;  
    }  
}  

getAll('2014-01-01', '2018-10-07'); 

// for(var position in chooseDate){
//     getArticle(chooseDate[position]);
// }

var task = setInterval(function(){
    getArticle(chooseDate[num]);
    num++;
    if(num >= chooseDate.length){
        clearInterval(task);
    }
},3000);

function getArticle(date){
    var url = 'https://interface.meiriyiwen.com/article/day?dev=1&date='+date;
    http.get(url, function (req, res) {
    let html = '';
    req.on('data', function (data) {
        html += data;
    });
    req.on('end', function () {
        //let result = JSON.parse(html);
        html = unescape(html.replace(/\\u/g, '%u'))
        console.log("result:" + html);
        var article = JSON.parse(html);
        var connection = getSQLConnection();

        var addSql = 'INSERT INTO article(curr,prevent,next,author,title,digest,content,wc) VALUES(?,?,?,?,?,?,?,?)';
        var addSqlParams = [article.data.date.curr,
                            article.data.date.prev,
                            article.data.date.next,
                            article.data.author,
                            article.data.title,
                            article.data.digest,
                            article.data.content,
                            article.data.wc];
        //增
        connection.query(addSql, addSqlParams, function (err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                return;
            }

            console.log('--------------------------INSERT----------------------------');
            //console.log('INSERT ID:',result.insertId);        
            console.log('INSERT ID:', result);
            console.log('-----------------------------------------------------------------\n\n');
        });

        connection.end();

    });
});

}





function getSQLConnection() {
    var connection = mysql.createConnection({
        host: 'www.dengjj.com',
        user: 'root',
        password: 'abc123@comic',
        database: 'wehhit'
    });

    connection.connect();

    return connection;

}