// ==UserScript==
// @name         MachineFlash
// @namespace    http://www.forsu.cn/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://210.39.2.59:8081/web.equipmentBooking/web/*
// @grant        none
// ==/UserScript==
var myurl = window.location.href;
var yourJob = "11";
var yourID = "11";
var flashTime = 500;                  //刷新网页
var waitLoadTime = 500;               //等待预约界面加载完全，如果延迟过大，必须调整该值，单位：ms
var findOneUsefulMachineTime = 500;  //切换到下一台机器的时间，单位：ms


function print(name){
    console.log(name);
}

//window.alert = function(str){ return ;}; //禁止alert

function aClick(el){
    var event = document.createEvent('MouseEvent');
    //event.initEvent('click', false, false);
    //el.dispatchEvent(event);
    event.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0,
                         false, false, false, false,
                         0, null);
    el.dispatchEvent(event);
}


function selectBase(reg){
    return document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
}

function getRightItem(items, attributeName, indexName){
    for(var i=0; i<items.snapshotLength; i++){
        var  thisItem = items.snapshotItem(i);
        if (thisItem.getAttribute(attributeName).indexOf(indexName) != -1) {
            //print("items ok");
            return thisItem;
        }else{
            //print("false");
        }
    }
    return false;
}

function getFinalItem(items, attributeName){
    var i=items.snapshotLength;
    if(i !== 0){
        return items.snapshotItem(i-1);
    }else{
        return false;
    }
}


function ShowObjProperty(Obj) {
    var PropertyList='';
    var PropertyCount=0;
    var i;
    for(i in Obj){
        if(Obj.i !==null)
            PropertyList=PropertyList+i+'属性：'+Obj.i+'\r\n';
        else
            PropertyList=PropertyList+i+'方法\r\n';
    }
    alert(PropertyList);
}

function showAttr(obj){
    var str='';
    for(var tmp in obj){
        str=str+tmp+", ";
    }
    alert(str);
}

function closeConfirm(){
    var allChoose = selectBase('//a[@class]');
    var thisChoose = getRightItem(allChoose, "class", "order_popup_close");aClick(thisChoose);
}

function enterProcess(){
    var allChoose = selectBase('//a[@title]');
    var allCheck = selectBase('//input[@id]');
    var allClick = selectBase('//a[@id]');
    var thisChoose = getRightItem(allChoose, "title", " 建筑模型与构造实验室");aClick(thisChoose);

    var thisCheck = getRightItem(allCheck, "id", "needNow").click(); //勾选同意

    var thisClick = getRightItem(allClick, "id", "equipmentListPage");aClick(thisClick);
    closeConfirm();
}

function inputNeed(name, value){
    var allMachine = selectBase('//input[@id]');
    var _my= getRightItem(allMachine, "id", name);
    if (_my === 0){
        //print("get machine false");
        window.location.reload();
    }else{
        //showAttr(_my);
        //alert(_my.value);
        _my.setAttribute("value", value);
    }
}

function clickTime(time){
    switch(time){
        case 9:
            realTime = "105";break;
        case 10:
            realTime = "106";break;
        case 11:
            realTime = "107";break;
        case 14:
            realTime = "108";break;
        case 15:
            realTime = "109";break;
        case 16:
            realTime = "110";break;
        case 17:
            realTime = "111";break;
        case 18:
            realTime = "112";break;
        case 19:
            realTime = "113";break;
        case 20:
            realTime = "114";break;
    }
    var allUseful = selectBase('//a[@class]');
    for(var i=0; i<allUseful.snapshotLength; i++){
        var thisItem = allUseful.snapshotItem(i);
        if (thisItem.getAttribute("class").indexOf("unsubscribe") != -1) {
            //print("items ok");
            if(thisItem.getAttritube("num").indexof(realTime)!=-1){
                continue;
            }else{
                print("thisItem OK;");
                return thisItem;
            }
        }
    }
}

function clickFinalDay(){
    var allDay = selectBase('//li[@onclick]');
    var thisDay = getFinalItem(allDay, "onclick").click();
    //showAttr(thisDay);
    //alert("ClickDay OK");
}

function clickMachine(num){
    var realNum;
    switch(num){
        case 2:
            realNum="197";
            break;
        case 3:
            realNum="199";
            break;
        case 4:
            realNum="200";
            break;
        default:
            realNum="192";
            break;
    }
    var allMachine = selectBase('//a[@name]');
    var thisMachine = getRightItem(allMachine, "name", realNum);
    //aClick(thisMachine);
    if(thisMachine!==false){
        //print("thisMachine OK");
        aClick(thisMachine);
        //clickMachine(9);
        return true;
    }else{
        return false;
    }
}



function findUseful(){
    //print("run findUseful");
    var allUseful = selectBase('//a[@class]');
    for(var i=0; i<allUseful.snapshotLength; i++){
        var thisItem = allUseful.snapshotItem(i);
        if (thisItem.getAttribute("class").indexOf("unsubscribe") != -1) {
            //alert("findUseful true");
            //aClick(thisItem);
            return true;
        }
    }
    print("can't found Useful");
    return false;
}


function allProcess() {
    try{

        //if( getRightItem(selectBase('//input[@id]'), "id", "jobName")!==null)
        //准备工作
        enterProcess();
        inputNeed("jobName", yourJob);
        inputNeed("bookingUserTel", yourID);

        //开始找可以预约的
        var found;
        var promise = new Promise(function(resolve, reject) {
            window.setTimeout(function() {
                setTimeout(
                    function() {
                        for(var i=1;i<=4;i++){
                            setTimeout((function(i){
                                return function(){
                                    print("test machine "+i);
                                    clickMachine(i);  //选择几号机器
                                    clickFinalDay();  //选择最后一天
                                    if(findUseful()===true){
                                        //alert("true");
                                        resolve(true);
                                        return true;
                                    }else{
                                        if(i==4){
                                            resolve(false);
                                        }
                                    }

                                };
                            })(i), findOneUsefulMachineTime*i);
                        }
                    },waitLoadTime);
            });
        });
        return promise;
    }
    catch(err){
        print(err);
        setTimeOut(function(){window.location.reload();},1000);
    }
}

var button = document.createElement("button");
button.innerHTML = "Stop";
button.id="loopButton";
button.setAttribute("style", "position:absolute; right: 0px;font-size: 45px; font-style: italic; color:#ff0000;background-color:#080808;height:95px;font-family:Microsoft YaHei;");
var body = document.getElementsByTagName("div")[0];
body.appendChild(button);
button.addEventListener ("click", function() {
    button.innerHTML="Start";
});


allProcess().then(function(done) {
    //alert(promise);
    //print(done);
    if(done!==true);{
        if(button.innerHTML==="Start"){
            throw new Error("Something went badly wrong!");
        }else{
            setTimeout(
                function(){
                    if(button.innerHTML==="Start"){
                        throw new Error("Something went badly wrong!");
                    }else{
                        window.location.reload();}
                },flashTime);
        }

    }
});
//if(allProcess()===false){window.location.reload();}
//如果是某div的滚动条如id=content的div，类似：
//document.body.scrollTop = document.body.scrollHeight;
//document.getElementById('content').scrollTop = document.getElementById('content').scrollHeight;

