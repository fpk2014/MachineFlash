// ==UserScript==
// @name         MachineFlash
// @namespace    https://github.com/fpk2014
// @version      0.4
// @description  激切抢预约，自用脚本
// @author       fpk2014
// @match        http://210.39.2.59:8081/web.equipmentBooking/web/book*
// @updateURL    https://raw.githubusercontent.com/fpk2014/MachineFlash/master/MachineFlash.user.js
// @downloadURL  https://raw.githubusercontent.com/fpk2014/MachineFlash/master/MachineFlash.user.js
// @require      http://crypto.stanford.edu/sjcl/sjcl.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==


var myurl = window.location.href;
var FLASH_TIME = 500;                      //刷新网页时间，单位：ms
var WAIT_LOAD_TIME = 200;                  //等待预约界面加载完全，如果延迟过大，必须调整该值，单位：ms
var Find_ONE_USEFUL_MACHINE_TIME = 500;    //切换到下一台机器的时间，单位：ms
var MACHINE_NUMBER = 2;                    //机器数量
var IDEAL_TIME = 10;                       //默认选择的时间段
var PRINT_LOG = false;
var encKey  = GM_getValue ("encKey",  "");
var yourJob = GM_getValue ("lognUsr", "");
var yourID  = GM_getValue ("lognPwd", "");


//-- Prepare: Get_Value --//
if (!encKey) {
    encKey  = prompt (
        'Script key not set for ' + location.hostname + '. Please enter a random string:',
        ''
    );
    GM_setValue ("encKey", encKey);
    yourJob     = yourID = "";   // New key makes prev stored values (if any) unable to decode.
}
GM_registerMenuCommand ("修改作业名称", changeUsername);
GM_registerMenuCommand ("修改手机号码", changePassword);

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


yourJob = decodeOrPrompt (yourJob,   "作业名称",  "lognUsr");
yourID  = decodeOrPrompt (yourID,    "手机号码",  "lognPwd");

Print("作业名称:" + yourJob + "  手机号码:" + yourID);


//- - Start - -//
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


function Print(name){
    if(PRINT_LOG)
        console.log(name);
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//window.alert = function(str){ return ;}; //禁止alert


function Get_Right_Item(reg, attributeName, indexName){
    var items = document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<items.snapshotLength){
        var  thisItem = items.snapshotItem(i);
        if (thisItem.getAttribute(attributeName).indexOf(indexName) != -1) {
            //Print("items ok");
            return thisItem;
        }
        i++;
    }
    return false;
}

//用于选择到激切最近开放的工作日
function Get_Final_Item(items, attributeName){
    var i=items.snapshotLength;
    if(i !== 0){
        return items.snapshotItem(i-1);
    }else{
        return false;
    }
}


function Click_Final_Day(reg, attributeName){
    var items = document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
    return Get_Final_Item(items, attributeName);
    //showAttr(thisDay);
    //alert("ClickDay OK");
}


//填入作业名称或手机号
function Input_Name_Or_PhoneID(reg, attributeName, indexName, value_reg, value){
    var _my= Get_Right_Item(reg, attributeName, indexName);
    if (_my === 0){
        //Print("get machine false");
        window.location.reload();
    }else{
        _my.setAttribute(value_reg, value);
    }
}

//选择特定的时间段
function Click_Time(reg, attributeName, indexName, time_reg, time){
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
    var aUseful = document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);;

    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<aUseful.snapshotLength){
        var thisAUseful = aUseful.snapshotItem(i);
        if (thisAUseful.getAttribute(attributeName).indexOf(indexName) != -1) {
            //alert(thisAUseful.getAttribute("name"));
            //Print("items ok");
            if(thisAUseful.getAttribute(time_reg)===realTime){
                //alert("OK");
                Print(time+" clocks is OK!!!Choose!!!");
                //clickChoose(thisAUseful);
                thisAUseful.click();
                return true;
            }
        }
        i++;
    }

    Print(time+" clocks can't been preserved;");
    return false;
}



//选中某台机器
function Click_Machine(reg, attributeName, num){
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
    var thisMachine = Get_Right_Item(reg, attributeName, realNum);
    //clickChoose(thisMachine);
    if(thisMachine!==false){
        //Print("thisMachine OK");
        //clickChoose(thisMachine);
        return thisMachine;
    }else{
        return false;
    }
}


//遍历某机器的可用时间段
function Find_Useful(reg, attributeName, indexName){
    //Print("run Find_Useful");
    var allUseful = document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
    var i=0;
    //alert(allUseful.snapshotLength);
    while(i<allUseful.snapshotLength){
        var thisUseful = allUseful.snapshotItem(i);
        //alert(thisUseful.getAttribute("class"));
        if (thisUseful.getAttribute(attributeName).indexOf(indexName) != -1) {
            //alert("Find_Useful true");
            Print("found useful!!!Choose!!!");
            //clickChoose(thisUseful);
            thisUseful.click();
            return true;
        }
        i++;
    }
    Print("All machine have been preserved;");
    return false;
}


async function All_Process() {
    try{

        //if( Get_Right_Item(selectBase('//input[@id]'), "id", "jobName")!==null)
        //准备工作:跳转到下一步骤
        Get_Right_Item('//a[@class]',   "class",  "dispark_order chke").click();                        //点击预约按钮
        Get_Right_Item('//input[@id]',  "id",     "needNow"           ).click();                        //勾选同意
        Get_Right_Item('//a[@id]',      "id",     "equipmentListPage" ).click();                        //点击下一步按钮
        Get_Right_Item('//a[@class]',   "class",  "order_popup_close" ).click();                        //关闭协议框
        
        Input_Name_Or_PhoneID('//input[@id]',  "id",  "jobName",        "value", yourJob);              //输入作业名称
        Input_Name_Or_PhoneID('//input[@id]',  "id",  "bookingUserTel", "value", yourID );              //输入手机号码

        //
        await Sleep(WAIT_LOAD_TIME);    //等待加载完成

        //- - 开始找可以预约的 - -//
        //遍历所有机器
        for(var i=1; i<=MACHINE_NUMBER; i++){
            await Sleep(Find_ONE_USEFUL_MACHINE_TIME*i); //等待加载完成
            
            Print("test machine "+i);
            Click_Machine('//a[@name]',       "name", i).click();                                         //选择i号机器
            Click_Final_Day('//li[@onclick]', "onclick").click();                                         //选择最后一天
            
            //遍历所有可用的时间段
            await Sleep(WAIT_LOAD_TIME);                                                                  //等待加载完成
            if(button.innerHTML==="Start"){return;}
            //if(Click_Time('//a[@class]',   "class", "no_subscribe", "name", IDEAL_TIME===true)){return;}  //寻找特定时间点的机器
            if(Find_Useful('//a[@class]',  "class", "no_subscribe")===true){return;}                      //寻找可用的机器
        }

        //- - 找不到可用的机器，重新加载 - -//
        await Sleep(FLASH_TIME);
        window.location.reload();
    }
    catch(err){
        Print(err);
        //await Sleep(10000);
        window.location.reload();
    }
}


//运行
All_Process();

async function test(){
    Get_Right_Item(       '//a[@class]',   "class",  "dispark_order chke").click();
    Get_Right_Item(       '//input[@id]',  "id",     "needNow").click();//勾选同意
    Get_Right_Item(       '//a[@id]',      "id",     "equipmentListPage").click();
    Get_Right_Item(       '//a[@class]',   "class",  "order_popup_close").click();
    Input_Name_Or_PhoneID('//input[@id]',  "id",     "jobName",        "value", yourJob);
    Input_Name_Or_PhoneID('//input[@id]',  "id",      "bookingUserTel", "value", yourID);

    await Sleep(1000);
    Click_Machine('//a[@name]',       "name", MACHINE_NUMBER).click();  //选择几号机器
    Click_Final_Day('//li[@onclick]', "onclick").click(); //选择最后一天
}

//test();
