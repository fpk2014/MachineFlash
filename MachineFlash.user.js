// ==UserScript==
// @name         MachineFlash
// @namespace    https://github.com/fpk2014
// @version      0.6
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
var FLASH_TIME = 200;                      //刷新网页时间，单位：ms
var WAIT_LOAD_TIME = 200;                  //等待预约界面加载完全，如果延迟过大，必须调整该值，单位：ms
var CLICK_TIME = 100
var Find_ONE_USEFUL_MACHINE_TIME = 200;    //切换到下一台机器的时间，单位：ms
var MACHINE_NUMBER = 4;                    //机器数量
var PRINT_LOG = true;
function Print(name){
    if(PRINT_LOG)
        console.log(name);
}


var encKey   = GM_getValue ("encKey",  "");
var YOUR_JOB = GM_getValue("lognUsr", "");
var YOUR_ID  = GM_getValue("lognPwd", "");
var IDEAL_TIME    = GM_getValue ("timeID",    "");       //选择机器,单位：点
var IDEAL_MACHINE = GM_getValue ("machineID", "");       //选择时间段,单位：点

var AUTO_SUBMIT   = GM_getValue ("autoSubmit", "");                   //自动提交

//-- Prepare: Get_Value --//
if (!encKey) {
    encKey  = prompt (
        'Script key not set for ' + location.hostname + '. Please enter a random string:',
        ''
    );
    GM_setValue ("encKey", encKey);
    YOUR_JOB     = YOUR_ID = IDEAL_TIME = IDEAL_MACHINE = AUTO_SUBMIT = "";   // New key makes prev stored values (if any) unable to decode.
}
GM_registerMenuCommand ("修改作业名称", function(){
    promptAndChangeStoredValue (YOUR_JOB,   "作业名称", "lognUsr");
});
GM_registerMenuCommand ("修改手机号码", function(){
    promptAndChangeStoredValue (YOUR_ID,    "手机号码", "lognPwd");
});
GM_registerMenuCommand ("修改机器号"  , function(){
    promptAndChangeStoredValue (IDEAL_TIME, "时间点", "timeID");
});
GM_registerMenuCommand ("修改时间点"  , function() {
    promptAndChangeStoredValue (IDEAL_MACHINE, "机器号", "machineID");
}
);
GM_registerMenuCommand ("修改提交方法" ,function () {
    promptAndChangeStoredValue (AUTO_SUBMIT, "提交方法（输入true或者false）", "autoSubmit");
});
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


function promptAndChangeStoredValue (targVar, userPrompt, setValVarName) {
    targVar     = prompt (
        '修改' + userPrompt + ':',
        targVar
    );
    GM_setValue (setValVarName, encryptAndStore (targVar) );
}


YOUR_JOB     = decodeOrPrompt  (YOUR_JOB,      "作业名称", "lognUsr");
YOUR_ID      = decodeOrPrompt  (YOUR_ID,       "手机号码", "lognPwd");
IDEAL_TIME  = decodeOrPrompt   (IDEAL_TIME,    "时间点",   "timeID");
IDEAL_MACHINE  = decodeOrPrompt(IDEAL_MACHINE, "时间点",   "machineID");
AUTO_SUBMIT = decodeOrPrompt(AUTO_SUBMIT,    "时间点",   "autoSubmit");
Print("作业名称:" + YOUR_JOB + "  手机号码:" + YOUR_ID+ "  时间点:" + IDEAL_TIME+ "  机器号:" + IDEAL_TIME);


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

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//window.alert = function(str){ return ;}; //禁止alert
function Select_Base(myElement, myProperty){
    var reg = '//'+myElement+'[@'+myProperty+']';
    return document.evaluate(
        reg,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
}


function Get_Right_Item(myElement, myProperty, myValue){
    var items = Select_Base(myElement, myProperty);
    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<items.snapshotLength){
        var  thisItem = items.snapshotItem(i);
        if (thisItem.getAttribute(myProperty).indexOf(myValue) != -1) {
			Print("Get_Right_Item " + myValue + " success");
            return thisItem;
        }
        i++;
    }
	Print("Get_Right_Item " + myValue + " fail");
    return false;
}


//用于选择到激切最近开放的工作日
function Click_Final_Day(myElement, myProperty){
    var items = Select_Base(myElement, myProperty);
    var i=items.snapshotLength;
    if(i !== 0){
        return items.snapshotItem(i-1);
    }else{
        return false;
    }
}


//填入作业名称或手机号
function Input_Name_Or_PhoneID(myElement, myProperty, myValue, value_reg, value){
    var _my= Get_Right_Item(myElement, myProperty, myValue);
    if (_my === 0){
        //Print("get machine false");
        window.location.reload();
    }else{
        _my.setAttribute(value_reg, value);
    }
}

//选择特定的时间段
function Click_Time(myElement, myProperty, myValue, time_reg, time){
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
    var aUseful = Select_Base(myElement, myProperty);;

    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<aUseful.snapshotLength){
        var thisAUseful = aUseful.snapshotItem(i);
        if (thisAUseful.getAttribute(myProperty).indexOf(myValue) != -1) {
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
function Click_Machine(myElement, myProperty, num){
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
    var thisMachine = Get_Right_Item(myElement, myProperty, realNum);
	return thisMachine;
}


//遍历某机器的可用时间段
function Find_Useful(myElement, myProperty, myValue){
    //Print("run Find_Useful");
    var allUseful = Select_Base(myElement, myProperty);
    var i=0;
    //alert(allUseful.snapshotLength);
    while(i<allUseful.snapshotLength){
        var thisUseful = allUseful.snapshotItem(i);
        //alert(thisUseful.getAttribute("class"));
        if (thisUseful.getAttribute(myProperty).indexOf(myValue) != -1) {
            Print("found useful!!!Choose!!!");
            thisUseful.click();
            return thisUseful;
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
        await Sleep(WAIT_LOAD_TIME);
        Get_Right_Item('a',      "class",  "dispark_order chke").click();                          //点击预约按钮
        Get_Right_Item('input',  "id",     "needNow"           ).click();                          //勾选同意选项
        Get_Right_Item('a',      "id",     "equipmentListPage" ).click();                          //点击下一步按钮
        Get_Right_Item('a',      "class",  "order_popup_close" ).click();                          //关闭协议框
        Get_Right_Item('input',  "id",  "jobName"       ).setAttribute("value", YOUR_JOB);         //输入作业名称
        Get_Right_Item('input',  "id",  "bookingUserTel").setAttribute("value", YOUR_ID);          //输入手机号码

        //- - 开始找可以预约的 - -//

        //选择某台机器的某个时间点
        await Sleep(WAIT_LOAD_TIME);
        Click_Machine('a',       "name", parseInt(IDEAL_MACHINE)).click();                                   //选择某号机器
        await Sleep(WAIT_LOAD_TIME);  //等待加载完成
        Click_Final_Day('li',    "onclick").click();                                                         //选择最后一天
        await Sleep(WAIT_LOAD_TIME*3); //等待加载完成
        if(button.innerHTML==="Start"){return;}
        if(Click_Time('a',   "class", "no_subscribe", "name", parseInt(IDEAL_TIME))===true){
            if(AUTO_SUBMIT === "true"){
                Get_Right_Item('a',      "class",  "order_time_cont_but" ).click(); 
            }
            return;
		}         

        //选择某个时间点
        await Sleep(WAIT_LOAD_TIME);    //等待加载完成
        for(var i=1; i<=MACHINE_NUMBER; i++){
            await Sleep(WAIT_LOAD_TIME*i); //等待加载完成
            Print("test machine "+i);
            Click_Machine('a',       "name", i).click();                                                       //选择i号机器
            await Sleep(WAIT_LOAD_TIME*i);  //等待加载完成 
            Click_Final_Day('li',    "onclick").click();                                                       //选择最后一天
            await Sleep(WAIT_LOAD_TIME*i); //等待加载完成
            if(button.innerHTML==="Start"){return;}
            if(Click_Time('a',   "class", "no_subscribe", "name", parseInt(IDEAL_TIME))===true){return;}       //寻找特定时间点的机器
        } 


        //遍历所有可用机器，选择可用机器
        await Sleep(WAIT_LOAD_TIME);    //等待加载完成
        for(var i=1; i<=MACHINE_NUMBER; i++){
            await Sleep(Find_ONE_USEFUL_MACHINE_TIME*i); //等待加载完成

            Print("test machine "+i);
            Click_Machine('a',       "name", i).click();                                             //选择i号机器
            await Sleep(CLICK_TIME*i);  //等待加载完成
            Click_Final_Day('li',    "onclick").click();                                             //选择最后一天
            await Sleep(CLICK_TIME*i); //等待加载完成

            if(button.innerHTML==="Start"){return;}
            if(Find_Useful('a',  "class", "no_subscribe")===true){return;}                           //寻找可用的机器
        } 

        //- - 找不到可用的机器，重新加载 - -//
        await Sleep(FLASH_TIME);
        window.location.reload();
    }
    catch(err){
        Print(err);
        if(PRINT_LOG){
            await Sleep(10000);
        }
        window.location.reload();
    }
}


//运行
All_Process();

async function test(){
    Get_Right_Item('a',      "class",  "dispark_order chke").click();                          //点击预约按钮
    Get_Right_Item('input',  "id",     "needNow"           ).click();                          //勾选同意选项
    Get_Right_Item('a',      "id",     "equipmentListPage" ).click();                          //点击下一步按钮
    Get_Right_Item('a',      "class",  "order_popup_close" ).click();                          //关闭协议框

	Get_Right_Item('input',  "id",  "jobName"       ).setAttribute("value", YOUR_JOB);         //输入作业名称
	Get_Right_Item('input',  "id",  "bookingUserTel").setAttribute("value", YOUR_ID);          //输入手机号码

    await Sleep(500);
    Click_Machine('a',       "name", MACHINE_NUMBER).click();                                  //选择i号机器
    await Sleep(500);  //等待加载完成
    Click_Final_Day('li',    "onclick").click();                                               //选择最后一天
}

//test();
