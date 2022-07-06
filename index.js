

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
        "0 <br>(07:10~08:00)",
        "1 <br>(08:10~09:00)",
        "2 <br>(09:10~10:00)",
        "3 <br>(10:10~11:00)",
        "4 <br>(11:10~12:00)",
        "N <br>(12:10:13:00)",
        "5 <br>(13:10~14:00)",
        "6 <br>(14:10~15:00)",
        "7 <br>(15:10~16:00)",
        "8 <br>(16:10~17:00)",
        "9 <br>(17:10~18:00)",
        "A <br>(18:10~19:00)",
        "B <br>(19:10~20:00)",
        "C <br>(20:10~21:00)",
        "D <br>(21:10~22:00)",
    ]
    $("#classboard > tbody").children().remove()
    // console.log($("#classboard > tbody").children())
    classSession.forEach(element => {
        tr = `<tr ><th scope="row" style="break:break-all;" width="10px">${element}</th>`
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
                    <p>課程代號：${classId.split('-')[0] + '-' + (parseInt(classId.split('-')[1]) + 1).toString()}</p>
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
        $.toaster('成功刪除', '刪除課程', 'success');
        updExportmess()
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
    console.log(`cleared`)
    $.getJSON("111data.json", function (json) {
        if (Cookies.get('classSess') === undefined)
            return
        var classSess = JSON.parse(atob(Cookies.get('classSess')))
        var cnt = 0;
        classSess.forEach(element => {
            renderClassbtn(element, json[element], (cnt++) % btnStyleBag.length)
        })
    });
    updExportmess()
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

function chkClassesallExist(classes, classesJson) {
    var cnt = 0;
    classes.forEach(element => {
        if (element in classesJson) {
            cnt++;
        }
    }
    );
    console.log(cnt)
    return cnt === classes.length
}

function addClass(classid, classesJson, isparse = false) {
    if (!isparse && classid.includes('-')) {
        classid = classid.split('-')[0] + '-' + (parseInt(classid.split('-')[1]) - 1).toString()
    }
    console.log(classid)
    if (classid.length === 0) {
        $.toaster('新增失敗', '請輸入匯入代號', 'warning');
        return
    } else if (classid.includes('<') || classid.includes('>')) {
        $.toaster('新增失敗', '我知道你在幹嘛', 'danger');
        return
    } else if (classid in classesJson === false) {
        $.toaster('新增失敗', `找不到此課程代碼 ${classid}`, 'danger');
        return
    } else if (Array.isArray(classesJson[classid])) {
        console.log(classesJson)
        sz = classesJson[classid].length
        promptText = `此課程代碼 ${classid} 共有 ${sz} 門課程時段，請選擇要新增的時段，並輸入代號`
        for (var i = 0; i < sz; i++) {
            promptText += `\n${i}：[${classesJson[classid][i]['department']}-${classesJson[classid][i]['teacher']}]${classesJson[classid][i]['name']}（${classesJson[classid][i]['timeraw']}）`
        }//department teacher
        while (1) {
            resp = parseInt(prompt(promptText))
            if (0 <= resp && resp < sz) {
                addClass(`${classid}-${resp}`, classesJson, true)
                break
            }
        }
        return
    } else if (chkClassExist(classid, classesJson)) {
        $.toaster('新增失敗', `此課程已經存在 ${chkClassExist(classid, classesJson)}`, 'danger');
        return
    } else if (chkClassInterupt(classid, classesJson)) {
        $.toaster('新增失敗', `此課程與 ${chkClassInterupt(classid, classesJson)} 衝堂`, 'danger');
        return
    } else {
        if (Cookies.get('classSess') === undefined) {
            Cookies.set('classSess', btoa(JSON.stringify([classid])))
        } else {
            Cookies.set('classSess', btoa(JSON.stringify(JSON.parse(atob(Cookies.get('classSess'))).concat([classid]))))
        }
        $.toaster('新增成功', '新增課程', 'success');
        renderClassbtns()
    }
}

function putClassidbtnSubmit() {
    $("#classid_input_btn").click(() => {
        var classid = $("#classid_input").val()
        $.getJSON("111data.json", function (classesJson) {
            addClass(classid, classesJson)
        });
    })
}

function importClass(importCode, classesJson) {
    try {
        var importClass = JSON.parse(atob(importCode))
    } catch (e) {
        var importClass = false
    }
    if (importCode.length === 0) {
        $.toaster('匯入失敗', '請輸入匯入代號', 'warning');
        return false
    } else if (importClass === false) {
        $.toaster('匯入失敗', '匯入代號格式錯誤', 'danger');
        return false
    } else if (!chkClassesallExist(importClass, classesJson)) {
        $.toaster('匯入失敗', '課程代號內含有不存在的課程', 'danger');
        return false
    } else {
        modCookie(importCode)
        $.toaster('匯入成功', '匯入課程', 'success');
        return true
    }
}

function putClassImportbtnSubmit() {
    $("#confirmImportClass_btn").click(() => {
        var importCode = $("#confirmImportClass_input").val()
        $.getJSON("111data.json", function (classesJson) {
            if (importClass(importCode, classesJson)) {
                renderClassbtns()
            }
        })
    })
}

function copyToClipboard(copy_text) {
    navigator.clipboard.writeText(copy_text)
    return "success";
}



function updExportmess() {
    $("#urlButton_code").html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
  </svg>`);
    $("#urlButton_code").removeClass("btn-success")
        .addClass("btn-secondary");
    $("#urlButton_url").html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
      </svg>`);
    $("#urlButton_url").removeClass("btn-success")
        .addClass("btn-secondary");
    if (Cookies.get('classSess') === undefined) {
        $("#export_input_code").attr("value", "")
        $("#urlButton_code").attr("urlAttr", "")
        $("#export_input_url").attr("value", "")
        $("#urlButton_url").attr("urlAttr", "")
    } else {
        $("#export_input_code").attr("value", Cookies.get('classSess'))
        $("#urlButton_code").attr("urlAttr", Cookies.get('classSess'))
        $("#export_input_url").attr("value", `${window.location.href.split('?')[0]}?share=${encodeURIComponent(Cookies.get('classSess'))}`)
        $("#urlButton_url").attr("urlAttr", `${window.location.href.split('?')[0]}?share=${encodeURIComponent(Cookies.get('classSess'))}`)
    }

}

function putExportCopyBtn() {
    $("#urlButton_code").click(function () {
        if (copyToClipboard($("#urlButton_code").attr("urlAttr"))) {
            $("#urlButton_code").html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>`);
            $("#urlButton_code").removeClass("btn-secondary")
                .addClass("btn-success");
            $.toaster('複製成功', '匯出代碼', 'success');
            setTimeout(() => {
                $("#urlButton_code").html(`<svg xmlns="http://www.w3.org/2000/svg"
                        width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                        <path
                            d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                        <path
                            d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>`)
                $("#urlButton_code").removeClass("btn-success")
                    .addClass("btn-secondary");
            }, "2000");
        } else {
            $("#urlButton_code").text("複製失敗 :(");
            $("#urlButton_code").removeClass("btn-secondary")
                .addClass("btn-danger");
            console.error("Async: Could not copy text: ", err);
        }
        $("#okButton").css("display", "inline-block");
    })
    $("#urlButton_url").click(function () {
        if (copyToClipboard($("#urlButton_url").attr("urlAttr"))) {
            $("#urlButton_url").html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>`);
            $("#urlButton_url").removeClass("btn-secondary")
                .addClass("btn-success");
            $.toaster('複製成功', '匯出網址', 'success');
            setTimeout(() => {
                $("#urlButton_url").html(`<svg xmlns="http://www.w3.org/2000/svg"
                        width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                        <path
                            d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                        <path
                            d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>`)
                $("#urlButton_url").removeClass("btn-success")
                    .addClass("btn-secondary");
            }, "2000");
        } else {
            $("#urlButton_url").text("複製失敗 :(");
            $("#urlButton_url").removeClass("btn-secondary")
                .addClass("btn-danger");
            console.error("Async: Could not copy text: ", err);
        }
        $("#okButton").css("display", "inline-block");
    })
}

function convertBase64ToBlob(base64, type) {
    var bytes = window.atob(base64);
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
}

function putShareClassCopyBtn() {
    // Select the email link anchor text
    $("#shareclasscopy").click(() => {
        console.log($("#shareclassimg").attr("src").replace("data:image/png;base64", ""))
        const blobInput = convertBase64ToBlob($("#shareclassimg").attr("src").replace("data:image/png;base64,", ""), 'image/png');
        navigator.clipboard.write([new ClipboardItem({
            "image/png": blobInput
        })]).then(() => {
            $.toaster('複製成功', '分享課表', 'success');
        })
        return "success";
    })
}

function putShareClassDownloadBtn() {
    // Select the email link anchor text
    $("#shareclassdownload").click(() => {
        var a = document.createElement("a"); //Create <a>
        a.href = "data:image/png;base64," + $("#shareclassimg").attr("src").replace("data:image/png;base64,", "")
        a.download = "classboard.png"
        a.click();
    })
}

//TODO
//1. fulfill RWD (視窗)

function getQuery(q) {
    return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1];
}

function init() {
    if (getQuery("share") !== null) {
        $.getJSON("111data.json", function (classesJson) {
            if (Cookies.get('classSess')) {
                if (confirm("你這個動作將會覆蓋掉目前的課表")) {
                    console.log(getQuery("share"))
                    if (importClass(getQuery("share"), classesJson)) {
                        renderClassbtns()
                    } else {
                        renderClassbtns()
                    }
                } else {
                    renderClassbtns()
                }
            } else {
                if (importClass(getQuery("share"), classesJson)) {
                    renderClassbtns()
                } else {
                    renderClassbtns()
                }
            }
        })
    } else
        renderClassbtns()
}

function putTableconvertImageBtn() {
    $("#shareclass").click(function () {
        var html = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.min.js"
        integrity="sha384-kjU+l4N0Yf4ZOJErLsIcvOU2qSb74wXpOhqTvwVx3OElZRweTnQ6d31fXEoRD1Jy"
        crossorigin="anonymous"></script>`+ $("#classboardPre").html()
        console.log(html)
        var $div = $("#classboardimg");
        $div.html(`<div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
        </div>`)
        html2canvas($("#classboardPre")[0]).then(function (canvas) {
            $div.empty()
            $(`<img />`, { src: canvas.toDataURL("image/png"), id: "shareclassimg", style: "width:450px; display:block; margin:auto;" }).appendTo($div);
        });
    })
}


$(document).ready(function () {
    init()
    putClassidbtnSubmit()
    putExportCopyBtn()
    putClassImportbtnSubmit()
    putTableconvertImageBtn()
    putShareClassCopyBtn()
    putShareClassDownloadBtn()
    // console.log($("#classboard").html())
    //["A92E700"]
    // Cookies.set('classSess', 'WyJBOTJFNzAwIl0=');
    // console.log(JSON.parse(atob(Cookies.get('classSess'))));

});