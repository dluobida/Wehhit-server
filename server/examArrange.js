var http = require('http');
var cheerio = require('cheerio');
var ExamArrange = {};
module.exports = ExamArrange;


ExamArrange.getExgetExamListByCondition = function(examType,
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
    response) {
    var url = "http://exam.hhit.edu.cn/fgquery.do?status=advanceQuery&examType=" +
        examType + "&academic=" + academic + "&courseName=" + courseName +
        "&startExamDate=" + startExamDate + "&endExamDate=" + endExamDate +
        "&startTime=" + startTime + "&endTime=" + endTime + "&examUnit=" + examUnit +
        "&instituteid=" + instituteid + "&arrangeInstitute=" + arrangeInstitute + "&pagenow=" + pagenow;

    // console.log("condition:"+ url);
    exeFgqueryForList(url, response);

}

ExamArrange.getExamListById = function(studentId, response) {
    var url = "http://exam.hhit.edu.cn/fgquery.do?status=lowquery&tsid=" + studentId;
    exeFgqueryForList(url, response);
}


ExamArrange.getExamDetailById = function(examId, response) {
    var url = "http://exam.hhit.edu.cn/fgquery.do?status=examdetail&examid=" + examId;
    var req = http.get(encodeURI(url), function (req, res) {
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
            console.log("length=" + items.length);
            //循环items
            items.each(function (index, elem) {
                var exam = {};
                var detailItems = $(this).children('td');
                // console.log('examid:'+examid +"===="+examItems.length);
                //循环examItems
                detailItems.each(function (index, element) {
                    if (index % 2 != 0) {
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


            // console.log("最终的考试列表结果:"+ JSON.stringify(examDetail));

            response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
            response.end(JSON.stringify(examDetail));

        });

    });
    req.on('error',function(err){
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
        
    });
    req.end();
}


function exeFgqueryForList(url, response) {
    var req = http.get(encodeURI(url), function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
            var examList = [];

            var $ = cheerio.load(html);
            var items = $('#content > div > table > tbody > tr:nth-child(2) > td > table > tbody')
                .children('.trclick');
            console.log("length=" + items.length);
            //循环items
            items.each(function (index, elem) {
                var exam = {};
                var detailUrl = $(this).attr('onclick').replace("window.open('/fgquery.do?status=examdetail&examid=", '');
                var examid = detailUrl.replace("')", '');
                exam.examid = examid;
                var examItems = $(this).children('td');
                // console.log('examid:'+examid +"===="+examItems.length);
                //循环examItems
                examItems.each(function (i, e) {
                    var value = $(this).text().trim();
                    switch (i) {
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

            // console.log("最终的考试列表结果:"+ JSON.stringify(examList));
            response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
            response.end(JSON.stringify(examList));


        });
    });

    req.on('error',function(err){
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.end("请求失败:"+err);
        
    });
    req.end();



}

