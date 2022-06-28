

btnStyleBag = [
    "btn-primary",
    "btn-secondary",
    "btn-success",
    "btn-danger",
    "btn-warning",
    "btn-info",
    "btn-dark"
]

function genTimeboard() {
    weekId = [
        "M", //Mon
        "T", //Tue
        "W", //Wed
        "H", //Thu
        "F", //Fri
        "S", //Sat
        "U"  //Sun
    ]
    classSession = [
        "0 (07:10~08:00)",
        "1 (08:10~09:00)",
        "2 (09:10~10:00)",
        "3 (10:10~11:00)",
        "4 (11:10~12:00)",
        "N (12:10:13:00)",
        "5 (13:10~14:00)",
        "6 (14:10~15:00)",
        "7 (15:10~16:00)",
        "8 (16:10~17:00)",
        "9 (17:10~18:00)",
        "A (18:10~19:00)",
        "B (19:10~20:00)",
        "C (20:10~21:00)",
        "D (21:10~22:00)",
    ]
    $("#classboard > tbody").children().remove()
    // console.log($("#classboard > tbody").children())
    classSession.forEach(element => {
        tr = `<tr><th scope=\"row\">${element}</th>`
        weekId.forEach(week => {
            tr += `<td id="${week}-${element[0]}" style="vertical-align:middle;"></td>`
        })
        $("#classboard > tbody").append(tr)
    });
}

function pickbtnstyle(styleBagIndex) {
    return btnStyleBag[styleBagIndex]
}

function addBtnModal(classId, classEle) {

    var modalstr = `<div class="modal fade" id="${classId}-staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex=" - 1" aria-labelledby="${classId}-staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="${classId}-staticBackdropLabel">${classEle["name"]}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>課程代號：${classId}</p>
                    <p>系所名稱：${classEle["department"]}</p>
                    <p>選/必修：${classEle["chooseOrselect"]}</p>
                    <p>上課時間：${classEle["timeraw"]}</p>
                    <p>學分：${classEle["credit"]}</p>
                    <p>課程地圖：<a href="http://class-qry.acad.ncku.edu.tw/crm/course_map/course.php?dept=A9&cono=A92E700">點我</a></p>
                    <p>老師：${classEle["teacher"]}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="${classId}-del">刪除課程</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">關閉</button>
                </div>
            </div>
        </div >
    </div >`
    $(document.body).append(modalstr)
    $("#" + classId + "-del").click(function () {
        $(`#${classId}-staticBackdrop`).modal('hide')
        $(`#${classId}-staticBackdrop`).remove()
        $(`*#${classId}-btn`).each(function () {
            this.remove()
        })
        Cookies.set('classSess', btoa(JSON.stringify(JSON.parse(atob(Cookies.get('classSess'))).filter(element => element !== classId))))
        renderClassbtns()
    })
}

function renderClassbtn(classId, classEle, styleBagIndex) {
    var btnstyle = pickbtnstyle(styleBagIndex)
    classEle["time"].forEach(element => {
        $("#" + element).append(`<button class="btn ${btnstyle} btn-lg" id="${classId}-btn" name="${classId}" data-bs-toggle="modal" data-bs-target="#${classId}-staticBackdrop">${classEle["name"]}</button>`)
    })
    addBtnModal(classId, classEle)
}

function renderClassbtns() {
    genTimeboard()
    $.getJSON("111data.json", function (json) {
        if (Cookies.get('classSess') === undefined)
            return
        var classSess = JSON.parse(atob(Cookies.get('classSess')))
        var cnt = 0;
        classSess.forEach(element => {
            renderClassbtn(element, json[element], (cnt++) % btnStyleBag.length)
        })
    });

}


function chkClassExist(classid, classesJson) {
    if (Cookies.get('classSess') === undefined) {
        return false
    } else {
        var classSess = JSON.parse(atob(Cookies.get('classSess')))
        if (classSess.includes(classid)) {
            return classesJson[classid]["name"]
        } else {
            return false
        }
    }
}

function chkClassInterupt(classid, classesJson) {
    if (Cookies.get('classSess') === undefined) {
        return false
    }

    for (var i = 0; i < classesJson[classid]["time"].length; i++) {
        var ele = classesJson[classid]["time"][i]
        if ($("#" + ele).text().length !== 0) {
            return $("#" + ele).text()
        }
    }
    return false
}

function modCookie(cook) {
    Cookies.set('classSess', cook)
}

function putClassidbtnSubmit() {
    $("#classid_input_btn").click(() => {
        var classid = $("#classid_input").val()
        $.getJSON("111data.json", function (classesJson) {
            if (classid.length === 0) {
                alert("請輸入課程代號")
                return
            } else if (classid.includes('<') || classid.includes('>')) {
                alert(`我知道你在幹嘛`)
                return
            } else if (classid in classesJson === false) {
                alert(`找不到此課程代碼 ${classid}`)
                return
            } else if (chkClassExist(classid, classesJson)) {
                alert(`此課程已經存在 ${chkClassExist(classid, classesJson)}`)
                return
            } else if (chkClassInterupt(classid, classesJson)) {
                alert(`此課程與 ${chkClassInterupt(classid, classesJson)} 衝堂`)
                return
            } else {
                if (Cookies.get('classSess') === undefined) {
                    Cookies.set('classSess', btoa(JSON.stringify([classid])))
                } else {
                    Cookies.set('classSess', btoa(JSON.stringify(JSON.parse(atob(Cookies.get('classSess'))).concat([classid]))))
                }
                renderClassbtns()
            }
        });


    })
}

$(document).ready(function () {
    renderClassbtns()

    putClassidbtnSubmit()
    //["A92E700"]
    // Cookies.set('classSess', 'WyJBOTJFNzAwIl0=');
    // console.log(JSON.parse(atob(Cookies.get('classSess'))));

});