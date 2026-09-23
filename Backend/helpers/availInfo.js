
const dayDic = {"Mon" : 1, "Tue" : 2, "Wed" : 3, "Thu" : 4, "Fri" : 5, "Sat" : 6, "Sun" : 0};
const hours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
                "7pm", "8pm", "9pm", "10pm", "11pm", "12am", "1am", "2am", "3am", "4am",
                "5am", "6am", "7am", "8am"];

const hoursDic = {};

hours.forEach((val, idx) => hoursDic[val]=idx);

function matToDic(availMat) {
    const avail = [];

    availMat.forEach((hour, hourIdx) => {
        hour.forEach((day, dayIdx) => {
            if(day ==  1) avail.push([dayIdx, (hourIdx + 9) % 24]);
        });
    });

    return avail;
}

function dicToMat(availDic) {
    const availMat = [];
    console.log(availDic);
    for(let i = 0; i<24; i++){
        availMat.push([0,0,0,0,0,0,0]);
    }

    availDic.forEach(dayHour => {
        // inverse of matToDic: row 0 is 9am, so early-morning hours wrap around
        availMat[(dayHour.time + 15) % 24][dayHour.day] = 1;
    });

    return availMat;

}


module.exports = {dayDic, hours, hoursDic, matToDic, dicToMat};