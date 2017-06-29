// ==UserScript==
// @name         MachineFlash
// @namespace    http://www.forsu.cn/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        http://210.39.2.59:8081/web.equipmentBooking/web/book*

// @require  http://crypto.stanford.edu/sjcl/sjcl.js
// @grant    GM_getValue
// @grant    GM_setValue
// @grant    GM_registerMenuCommand
// ==/UserScript==

var encKey  = GM_getValue ("encKey",  "");
var yourJob     = GM_getValue ("lognUsr", "");
var yourID   = GM_getValue ("lognPwd", "");

if ( ! encKey) {
    /*
    encKey  = prompt (
        'Script key not set for ' + location.hostname + '. Please enter a random string:',
        ''
    );
    */
    GM_setValue ("encKey", encKey);
    yourJob     = yourID = "";   // New key makes prev stored values (if any) unable to decode.
}
yourJob         = decodeOrPrompt (yourJob,   "作业名称", "lognUsr");
yourID       = decodeOrPrompt (yourID, "手机号码", "lognPwd");
console.log("作业名称:"+yourJob+"  手机号码:"+yourID);
function decodeOrPrompt (targVar, userPrompt, setValVarName) {
    if (targVar) {
        targVar     = unStoreAndDecrypt (targVar);
    }
    else {
        targVar     = prompt (
            userPrompt + ' not set for ' + location.hostname + '. Please enter it now:',
            ''
        );
        GM_setValue (setValVarName, encryptAndStore (targVar) );
    }
    return targVar;
}

function encryptAndStore (clearText) {
    return  JSON.stringify (sjcl.encrypt (encKey, clearText) );
}

function unStoreAndDecrypt (jsonObj) {
    return  sjcl.decrypt (encKey, JSON.parse (jsonObj) );
}

//-- Add menu commands that will allow U and P to be changed.
GM_registerMenuCommand ("修改作业名称", changeUsername);
GM_registerMenuCommand ("修改手机号码", changePassword);

function changeUsername () {
    promptAndChangeStoredValue (yourJob,   "作业名称", "lognUsr");
}

function changePassword () {
    promptAndChangeStoredValue (yourID, "手机号码", "lognPwd");
}

function promptAndChangeStoredValue (targVar, userPrompt, setValVarName) {
    targVar     = prompt (
        '修改' + userPrompt + ':',
        targVar
    );
    GM_setValue (setValVarName, encryptAndStore (targVar) );
}











var myurl = window.location.href;
var flashTime = 500;                  //刷新网页时间，单位：ms
var waitLoadTime = 200;                //等待预约界面加载完全，如果延迟过大，必须调整该值，单位：ms
var findOneUsefulMachineTime = 500;    //切换到下一台机器的时间，单位：ms
var machineNum = 2;                    //机器数量
var idealtime = 10;                    //默认选择的时间段

function print(name){
    console.log(name);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//window.alert = function(str){ return ;}; //禁止alert

//模拟鼠标点击
/*
function clickChoose(el){
    var event = document.createEvent('MouseEvent');
    //event.initEvent('click', false, false);
    //el.dispatchEvent(event);
    
    event.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0,
                         false, false, false, false,
                         0, null);
                         
    //event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    el.dispatchEvent(event);
}
*/


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

//用于选择到激切最近开放的工作日
function getFinalItem(items, attributeName){
    var i=items.snapshotLength;
    if(i !== 0){
        return items.snapshotItem(i-1);
    }else{
        return false;
    }
}

/*
//测试用的
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
*/

function closeConfirm(){
    var allChoose = selectBase('//a[@class]');
    var thisChoose = getRightItem(allChoose, "class", "order_popup_close").click();
}

//勾选确认框，跳转到下一步骤
function enterProcess(){
    var allChoose = selectBase('//a[@class]');
    var allCheck = selectBase('//input[@id]');
    var allClick = selectBase('//a[@id]');
    var thisChoose = getRightItem(allChoose, "class", "dispark_order chke").click();

    var thisCheck = getRightItem(allCheck, "id", "needNow").click();//勾选同意

    var thisClick = getRightItem(allClick, "id", "equipmentListPage").click();
    closeConfirm();
}

//选中最后一天
function clickFinalDay(){
    var allDay = selectBase('//li[@onclick]');
    var thisDay = getFinalItem(allDay, "onclick").click();
    //showAttr(thisDay);
    //alert("ClickDay OK");
}

//填入作业名称或手机号
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
    var realTime;
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
    var aUseful = selectBase('//a[@class]');

    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<aUseful.snapshotLength){
        var thisAUseful = aUseful.snapshotItem(i);
        if (thisAUseful.getAttribute("class").indexOf("no_subscribe") != -1) {
            //alert(thisAUseful.getAttribute("name"));
            //print("items ok");
            if(thisAUseful.getAttribute("name")===realTime){
                //alert("OK");
                print(time+" clocks is OK!!!Choose!!!");
                //clickChoose(thisAUseful);
                thisAUseful.click();
                return true;
            }
        }
        i++;
    }

    print(time+" clocks can't been preserved;");
    return false;
}



//选中某台机器
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
    //clickChoose(thisMachine);
    if(thisMachine!==false){
        //print("thisMachine OK");
        //clickChoose(thisMachine);
        thisMachine.click();
        //clickMachine(9);
        return true;
    }else{
        return false;
    }
}


//遍历某机器的可用时间段
function findUseful(){
    //print("run findUseful");
    var allUseful = selectBase('//a[@class]');
    var i=0;
    //alert(allUseful.snapshotLength);
    while(i<allUseful.snapshotLength){
        var thisUseful = allUseful.snapshotItem(i);
        //alert(thisUseful.getAttribute("class"));
        if (thisUseful.getAttribute("class").indexOf("no_subscribe") != -1) {
            //alert("findUseful true");
            print("found useful!!!Choose!!!");
            //clickChoose(thisUseful);
            thisUseful.click();
            return true;
        }
        i++;
    }
    print("All machine have been preserved;");
    return false;
}
//创建暂停按钮
var button = document.createElement("button");
button.innerHTML = "Stop";
button.id="loopButton";
button.setAttribute("style", "position:absolute; right: 0px;font-size: 45px; font-style: italic; color:#ff0000;background-color:#080808;height:95px;font-family:Microsoft YaHei;");
var body = document.getElementsByTagName("div")[0];
body.appendChild(button);
button.addEventListener ("click", function() {
    if(button.innerHTML==="Start"){
        window.location.reload();
    }
    if(button.innerHTML==="Stop"){
        button.innerHTML="Start";
    }
});

function myTest(){
    //alert("run");
    var f = document.getElementsByClassName("subscribe");
    alert(f.length);
    var i=0;
    while(i<f.length){
        alert(f[i].innerHTML);
    }
}

async function allProcess() {
    try{

        //if( getRightItem(selectBase('//input[@id]'), "id", "jobName")!==null)
        //准备工作
        enterProcess();
        inputNeed("jobName", yourJob);
        inputNeed("bookingUserTel", yourID);

        //
        await sleep(waitLoadTime);  //等待加载完成

        //开始找可以预约的，遍历所有机器
        for(var i=1;i<=machineNum;i++){
            await sleep(findOneUsefulMachineTime*i); //按顺序执行
            print("test machine "+i);
            clickMachine(i);  //选择几号机器
            clickFinalDay();  //选择最后一天
            //遍历所有可用的时间段
            if(button.innerHTML==="Start"){
                return;
            }

            await sleep(waitLoadTime);  //等待加载完成
            if(clickTime(idealtime)===true){return;}  //寻找特点时间点的机器
            if(findUseful()===true){return;}
        }

        //找不到可用的机器，重新加载
        await sleep(flashTime);
        window.location.reload();
    }
    catch(err){
        print(err);
        //await sleep(10000);
        window.location.reload();
    }
}



allProcess();
//if(allProcess()===false){window.location.reload();}
//如果是某div的滚动条如id=content的div，类似：
//document.body.scrollTop = document.body.scrollHeight;
//document.getElementById('content').scrollTop = document.getElementById('content').scrollHeight;

function test(){
    enterProcess();
    inputNeed("jobName", yourJob);
    inputNeed("bookingUserTel", yourID);

    clickMachine(machineNum);  //选择几号机器
    clickFinalDay();  //选择最后一天
}
