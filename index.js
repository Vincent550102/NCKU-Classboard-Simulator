
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
    classSession.forEach(element => {
        tr = `<tr><th scope=\"row\">${element}</th>`
        weekId.forEach(week => {
            tr += `<td id="${week}-${element[0]}"></td>`
        })
        console.log(tr)
        $(classboard).append(tr)
    });
}


$(document).ready(function () {
    genTimeboard()
    //["F720401-2","F715611"]
    Cookies.set('classSess', 'WyJGNzIwNDAxLTIiLCJGNzE1NjExIl0=');
    console.log(JSON.parse(atob(Cookies.get('classSess'))));

});