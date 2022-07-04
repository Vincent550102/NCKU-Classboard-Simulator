from time import time
import requests
import json

weekId = [
    "M",  # Mon
    "T",  # Tue
    "W",  # Wed
    "H",  # Thu
    "F",  # Fri
    "S",  # Sat
    "U"  # Sun
]
jsonboard = requests.get('https://nckuhub.com/course/').json()
myboard = dict()
print(len(jsonboard['courses']))

'''
{
    "id": 363,
    "系號": "A9",
    "選課序號": "046",
    "課程名稱": "音樂舞蹈戲劇",
    "老師": "林怡薇",
    "時間": "[2]3~4 ",
    "學分": 2,
    "選必修": "必修",
    "系所名稱": "通識中心 ",
    "comment_num": 94,
    "課程碼": "A92E700"
}


"A92F001": {
        "name": "東方閃電",
        "department": "通識中心",
        "chooseOrselect": "必修",
        "time": [
            "W-4",
            "W-5"
        ],
        "timeraw": "[3]4~5",
        "teacher": "林怡薇",
        "credit": 2
    }
'''


def dec2hex(n):
    return hex(n)[2:].upper()


def hex2dec(n):
    return int(n, 16)


def parse_time(rawtime, courseEle):
    retime = []
    for timeele in rawtime.strip().split(" "):
        # print(courseEle, timeele)
        if "[" not in timeele:
            continue
        weekcode = 1
        start = 1
        end = 1
        try:
            weekcode = weekId[int(timeele[1]) - 1]
            if '~' not in timeele:
                if len(timeele.strip()) <= 3:
                    continue
                retime.append(f"{weekcode}-{timeele[3]}")
            else:
                if timeele[3] == 'N':
                    retime.append(f"{weekcode}-N")
                    start = 5
                else:
                    start = hex2dec(timeele[3])

                if timeele[5] == 'N':
                    retime.append(f"{weekcode}-N")
                    end = 4
                else:
                    end = hex2dec(timeele[5])
                for i in range(start, end + 1):
                    retime.append(f"{weekcode}-{dec2hex(i)}")
        except BaseException as e:
            print(e)
            print(timeele[3], timeele[5], start, end, weekcode)
            print("exp", courseEle)
    return retime


def parse_course(courseEle):
    myEle = {
        "name": courseEle['課程名稱'],
        "department": courseEle['系所名稱'],
        "chooseOrselect": courseEle['選必修'],
        "time": parse_time(courseEle['時間'], courseEle),
        "timeraw": courseEle['時間'],
        "teacher": courseEle['老師'],
        "credit": courseEle['學分']
    }
    return myEle


for course in jsonboard['courses']:
    courseid = course['課程碼']
    if courseid in myboard:
        if course == myboard[courseid]:
            continue
        if isinstance(myboard[courseid], list):
            myboard[courseid].append(
                parse_course(course))
        else:
            myboard[courseid] = [myboard[courseid], parse_course(course)]
    else:
        myboard[courseid] = parse_course(course)

dictneedadd = {}

for courseid in myboard:
    if isinstance(myboard[courseid], list):
        for idx, course in enumerate(myboard[courseid]):
            dictneedadd["{}-{}".format(courseid, idx)] = course
d = myboard.copy()
d.update(dictneedadd)

with open('src\\111data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=4)
