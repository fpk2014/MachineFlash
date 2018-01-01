// ==UserScript==
// @name         MachineFlash
// @namespace    https://github.com/fpk2014
// @version      0.9
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
var WAIT_LOAD_TIME = 100;                  //等待等待加载完成时间，单位：ms
var Find_ONE_USEFUL_MACHINE_TIME = 200;    //切换到下一台机器的时间，单位：ms
var MACHINE_NUMBER = 4;                    //机器数量
var PRINT_LOG = false;
function Print(name, out = PRINT_LOG){
    if(PRINT_LOG)
        console.log(name);
}


var encKey   = GM_getValue("encKey");
if (!encKey) {
    //encKey  = prompt ('Script key not set for ' + location.hostname + '. Please enter a random string:','');
    GM_setValue ("encKey", "machineflash");
}
function decodeOrPrompt (targVar, userPrompt, setValVarName, varname="") {
    if (targVar) {
        targVar     = unStoreAndDecrypt (targVar);
    }
    else {
		targVar     = prompt (varname,'');
        GM_setValue (varname, encryptAndStore(encKey) );
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
        userPrompt,
        targVar
    );
    GM_setValue (setValVarName, encryptAndStore (targVar) );
}

function Get_Data(varname, proverty, detail, defaults=""){
    var tmp = GM_getValue(varname);
    GM_registerMenuCommand (proverty, function(){
        promptAndChangeStoredValue (tmp,   detail, varname);
    });
    tmp = decodeOrPrompt(tmp,      defaults, detail, varname);
    return tmp;
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


function Get_Right_Item(myElement, myProperty, myValue, out=PRINT_LOG){
    var nlog = "Get_Right_Item(): "+ myElement + " " + myProperty + " "+ myValue+ " : ";
    var items = Select_Base(myElement, myProperty);
    var i=0;
    //alert(aUseful.snapshotLength);
    while(i<items.snapshotLength){
        var  thisItem = items.snapshotItem(i);
        if (thisItem.getAttribute(myProperty).indexOf(myValue) != -1) {
            Print(nlog+"success", out);
            return thisItem;
        }
        i++;
    }
    Print(nlog+" can't find", out);
    return false;
}

function Get_Many_items(myElement, myProperty, myValue){
    var nlog = "Get_Many_items(): "+ myElement + " " + myProperty + " "+ myValue+ " : ";
    var aUseful = Select_Base(myElement, myProperty);
    var items = [];
    var i = 0;var j=0;
    //Print(nlog+"Useful number is "+aUseful.snapshotLength);
    while(i<aUseful.snapshotLength){
        var thisAUseful = aUseful.snapshotItem(i);
        if (thisAUseful.getAttribute(myProperty).indexOf(myValue) != -1) {
            items[j++]=thisAUseful;
        }
        i++;
    }
    if(j===0)
        return false;
    else{
        Print(nlog+"find "+ items.length +" items is useful");
        return items;
    }
}

//用于选择到激切最近开放的工作日
function Click_Final_Day(myElement, myProperty, myValue){
    var items = Get_Many_items(myElement, myProperty, myValue);
    var i=items.length;
    if(i !== 0){
        items[i-1].click();
        Print("Click_Final_Day(): success");
        return items[i-1];
    }else{
        return false;
    }
}


//选择特定的时间段
function Click_Time(myElement, myProperty, myValue, time_reg, time){
    var realTimeDic = {9:"105", 10:"106", 11:"107",
                       15:"109", 16:"110", 17:"111",
                       18:"112", 19:"113", 20:"114",};
    var items = Get_Many_items(myElement, myProperty, myValue);
    if(items===false){
        Print("Click_Time(): "+time+":00 can't find.");
        return false;
    }

    var i=0;
    while(i<items.length){
        var thisUseful = items[i];
        if (thisUseful.getAttribute(myProperty).indexOf(myValue) != -1) {
            //Print("Click_Time():get the right item");
            if(thisUseful.getAttribute(time_reg)===realTimeDic[time]){
                Print("Click_Time(): "+ time +":00 is selected!");
                thisUseful.click();
                return true;
            }
        }
        i++;
    }
    Print("Click_Time(): "+time+":00 can't been preserved;");
    return false;
}



//选中某台机器
function Click_Machine(myElement, myProperty, num){
    var realNumDic = {4:"192", 3:"197", 2:"199", 1:"200"};
    var thisMachine = Get_Right_Item(myElement, myProperty, realNumDic[num], false);
    if(thisMachine){
        Print("Click_Machine(): machine ID: " + num + " is clicked successfully.");
        thisMachine.click();
    }
    else
        Print("Click_Machine(): machine ID: " + num + "may not useful.");
}


//遍历某机器的可用时间段
function Click_Useful(myElement, myProperty, myValue){
    //Print("run Click_Useful");
    var items = Get_Many_items(myElement, myProperty, myValue, false);
    if(items===0 || items === false){
        Print("Click_Useful(): All machine have been preserved;");
        return false;
    }else{
        Print("items num: " +items+ ". Click_Useful(): Find a useful machine!!!");
        items[0].click();
        return items[0];
    }
    /*
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
    */
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


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

var YOUR_JOB      = Get_Data("loginUsr", "修改作业名称", "修改作业名称(格式为:XXXXXXXX作业)");
var SUBMIT_DAY    = Get_Data("submitDay", "修改交作业日期", "修改交作业日期(格式为:XX月XX号)");
var YOUR_ID       = Get_Data("yourID", "修改手机号码", "修改手机号码");
var IDEAL_MACHINE = Get_Data("machineID", "修改机器号", "修改机器号");
var IDEAL_TIME    = Get_Data("timeID", "修改机器时间点", "修改机器时间点(比如9点则输入9， 10点则输入10，依此类推)");
var AUTO_SUBMIT   = Get_Data("autoSubmit", "自动提交", "如果需要自动提交预约申请，输入true，否则输入false");
//Print("作业名称:" + YOUR_JOB + "  手机号码:" + YOUR_ID+ "  时间点:" + IDEAL_TIME+ "  机器号:" + IDEAL_MACHINE + " 自动提交: " + AUTO_SUBMIT);

async function All_Process() {
    try{
        //准备工作
        await Sleep(WAIT_LOAD_TIME);
        Get_Right_Item('a',      "class",  "dispark_order chke").click();                          //点击预约按钮
        Get_Right_Item('input',  "id",     "needNow"           ).click();                          //勾选同意选项
        Get_Right_Item('a',      "id",     "equipmentListPage" ).click();                          //点击下一步按钮
        Get_Right_Item('a',      "class",  "order_popup_close" ).click();                          //关闭协议框
        Get_Right_Item('input',  "id",  "jobName"       ).setAttribute("value", YOUR_JOB);         //输入作业名称
        Get_Right_Item('input',  "id",  "submitJobDate").setAttribute("value", SUBMIT_DAY);          //输入交作业日期
        Get_Right_Item('input',  "id",  "bookingUserTel").setAttribute("value", YOUR_ID);          //输入手机号码

        //- - 开始预约 - -//
        //路径一
        //选择某台机器的某个时间点
        await Sleep(WAIT_LOAD_TIME);
        Click_Machine('a',       "name", parseInt(IDEAL_MACHINE));                                   //选择某号机器
        await Sleep(WAIT_LOAD_TIME);
        Click_Final_Day('li',    "onclick", "findBookingRuleTime(this);return false;");                                                        //选择最后一天
        await Sleep(WAIT_LOAD_TIME*3);
        if(button.innerHTML==="Start"){return;}
        if(Click_Time('a',   "class", "no_subscribe", "name", parseInt(IDEAL_TIME))===true){
            if(AUTO_SUBMIT === "true"){
                Get_Right_Item('a',      "class",  "order_time_cont_but" ).click();
            }
            return;
        }

        //路径二
        //选择某个时间点
        await Sleep(WAIT_LOAD_TIME);
        for(var i=1; i<=MACHINE_NUMBER; i++){
            await Sleep(WAIT_LOAD_TIME*i);
            Print("choose time: test machine "+i);
            Click_Machine('a',       "name", i);                                                       //选择i号机器
            await Sleep(WAIT_LOAD_TIME*i);
            Click_Final_Day('li',    "onclick", "findBookingRuleTime(this);return false;");                                                                 //选择最后一天
            await Sleep(WAIT_LOAD_TIME*i);
            if(button.innerHTML==="Start"){return;}
            if(Click_Time('a',   "class", "no_subscribe", "name", parseInt(IDEAL_TIME))===true){return;}       //寻找特定时间点的机器
        }


        //路径三
        //遍历所有可用机器，选择可用机器
        await Sleep(WAIT_LOAD_TIME);
        for(var i=1; i<=MACHINE_NUMBER; i++){
            await Sleep(Find_ONE_USEFUL_MACHINE_TIME*i);

            Print("find useful: test machine "+i);
            Click_Machine('a',       "name", i);                                             //选择i号机器
            await Sleep(WAIT_LOAD_TIME*i);
            Click_Final_Day('li',    "onclick", "findBookingRuleTime(this);return false;");                                      //选择最后一天
            await Sleep(WAIT_LOAD_TIME*i);

            if(button.innerHTML==="Start"){return;}
            if(Click_Useful('a',  "class", "no_subscribe")){return;}                           //寻找可用的机器
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
    Click_Machine('a',       "name", MACHINE_NUMBER);                                  //选择i号机器
    await Sleep(500);  //等待加载完成
    Click_Final_Day('li',    "class", "chke");                                        //选择最后一天
}

//test();

