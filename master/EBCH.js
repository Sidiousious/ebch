// ==UserScript==
// @name Eli's BC Helper
// @namespace https://www.bondageprojects.com/
// @version 0.21
// @description A collection of helpful features for BC
// @author Elicia (Help from Sid)
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

  //SDK stuff

var bcModSdk=function(){"use strict";const o="1.0.2";function e(o){alert("Mod ERROR:\n"+o);const e=new Error(o);throw console.error(e),e}const t=new TextEncoder;function n(o){return!!o&&"object"==typeof o&&!Array.isArray(o)}function r(o){const e=new Set;return o.filter((o=>!e.has(o)&&e.add(o)))}const a=new Map,i=new Set;function d(o){i.has(o)||(i.add(o),console.warn(o))}function c(o,e){if(0===e.size)return o;let t=o.toString().replaceAll("\r\n","\n");for(const[n,r]of e.entries())t.includes(n)||d(`ModSDK: Patching ${o.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}function s(o){const e=[],t=new Map,n=new Set;for(const r of u.values()){const a=r.patching.get(o.name);if(a){e.push(...a.hooks);for(const[e,i]of a.patches.entries())t.has(e)&&t.get(e)!==i&&d(`ModSDK: Mod '${r.name}' is patching function ${o.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${t.get(e)||""}\nPatch2:\n${i}`),t.set(e,i),n.add(r.name)}}return e.sort(((o,e)=>e.priority-o.priority)),{hooks:e,patches:t,patchesSources:n,final:c(o.original,t)}}function l(o,e=!1){let r=a.get(o);if(r)e&&(r.precomputed=s(r));else{let e=window;const i=o.split(".");for(let t=0;t<i.length-1;t++)if(e=e[i[t]],!n(e))throw new Error(`ModSDK: Function ${o} to be patched not found; ${i.slice(0,t+1).join(".")} is not object`);const d=e[i[i.length-1]];if("function"!=typeof d)throw new Error(`ModSDK: Function ${o} to be patched not found`);const c=function(o){let e=-1;for(const n of t.encode(o)){let o=255&(e^n);for(let e=0;e<8;e++)o=1&o?-306674912^o>>>1:o>>>1;e=e>>>8^o}return((-1^e)>>>0).toString(16).padStart(8,"0").toUpperCase()}(d.toString().replaceAll("\r\n","\n")),l={name:o,original:d,originalHash:c};r=Object.assign(Object.assign({},l),{precomputed:s(l)}),a.set(o,r),e[i[i.length-1]]=function(o){return function(...e){const t=o.precomputed,n=t.hooks,r=t.final;let a=0;const i=d=>{var c,s,l,f;if(a<n.length){const e=n[a];a++;const t=null===(s=(c=w.errorReporterHooks).hookEnter)||void 0===s?void 0:s.call(c,o.name,e.mod),r=e.hook(d,i);return null==t||t(),r}{const n=null===(f=(l=w.errorReporterHooks).hookChainExit)||void 0===f?void 0:f.call(l,o.name,t.patchesSources),a=r.apply(this,e);return null==n||n(),a}};return i(e)}}(r)}return r}function f(){const o=new Set;for(const e of u.values())for(const t of e.patching.keys())o.add(t);for(const e of a.keys())o.add(e);for(const e of o)l(e,!0)}function p(){const o=new Map;for(const[e,t]of a)o.set(e,{name:e,originalHash:t.originalHash,hookedByMods:r(t.precomputed.hooks.map((o=>o.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return o}const u=new Map;function h(o){u.get(o.name)!==o&&e(`Failed to unload mod '${o.name}': Not registered`),u.delete(o.name),o.loaded=!1}function g(o,t,r){"string"==typeof o&&o||e("Failed to register mod: Expected non-empty name string, got "+typeof o),"string"!=typeof t&&e(`Failed to register mod '${o}': Expected version string, got ${typeof t}`),r=!0===r;const a=u.get(o);a&&(a.allowReplace&&r||e(`Refusing to load mod '${o}': it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),h(a));const i=t=>{"string"==typeof t&&t||e(`Mod '${o}' failed to patch a function: Expected function name string, got ${typeof t}`);let n=c.patching.get(t);return n||(n={hooks:[],patches:new Map},c.patching.set(t,n)),n},d={unload:()=>h(c),hookFunction:(t,n,r)=>{c.loaded||e(`Mod '${c.name}' attempted to call SDK function after being unloaded`);const a=i(t);"number"!=typeof n&&e(`Mod '${o}' failed to hook function '${t}': Expected priority number, got ${typeof n}`),"function"!=typeof r&&e(`Mod '${o}' failed to hook function '${t}': Expected hook function, got ${typeof r}`);const d={mod:c.name,priority:n,hook:r};return a.hooks.push(d),f(),()=>{const o=a.hooks.indexOf(d);o>=0&&(a.hooks.splice(o,1),f())}},patchFunction:(t,r)=>{c.loaded||e(`Mod '${c.name}' attempted to call SDK function after being unloaded`);const a=i(t);n(r)||e(`Mod '${o}' failed to patch function '${t}': Expected patches object, got ${typeof r}`);for(const[n,i]of Object.entries(r))"string"==typeof i?a.patches.set(n,i):null===i?a.patches.delete(n):e(`Mod '${o}' failed to patch function '${t}': Invalid format of patch '${n}'`);f()},removePatches:o=>{c.loaded||e(`Mod '${c.name}' attempted to call SDK function after being unloaded`);i(o).patches.clear(),f()},callOriginal:(t,n,r)=>(c.loaded||e(`Mod '${c.name}' attempted to call SDK function after being unloaded`),"string"==typeof t&&t||e(`Mod '${o}' failed to call a function: Expected function name string, got ${typeof t}`),Array.isArray(n)||e(`Mod '${o}' failed to call a function: Expected args array, got ${typeof n}`),function(o,e,t=window){return l(o).original.apply(t,e)}(t,n,r)),getOriginalHash:t=>("string"==typeof t&&t||e(`Mod '${o}' failed to get hash: Expected function name string, got ${typeof t}`),l(t).originalHash)},c={name:o,version:t,allowReplace:r,api:d,loaded:!0,patching:new Map};return u.set(o,c),Object.freeze(d)}function m(){const o=[];for(const e of u.values())o.push({name:e.name,version:e.version});return o}let w;const y=void 0===window.bcModSdk?window.bcModSdk=function(){const e={version:o,apiVersion:1,registerMod:g,getModsInfo:m,getPatchingInfo:p,errorReporterHooks:Object.seal({hookEnter:null,hookChainExit:null})};return w=e,Object.freeze(e)}():(n(window.bcModSdk)||e("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&e(`Failed to init Mod SDK: Different version already loaded ('1.0.2' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==o&&alert(`Mod SDK warning: Loading different but compatible versions ('1.0.2' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk);return"undefined"!=typeof exports&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();
//SDKstuff end



(async function () {

  const modApi = bcModSdk.registerMod('EBCH', '0.20');
  var HearingWhitelist = [];
  var notifwords = [];
  const GAGBYPASSINDICATOR = "\uf123";
  var ungarble = 0;
  antiGarbling();
  crCommands();
  var debug = 0;
  var focus = 1;
  var logging = 0;
  var notifs = 0;
  var db;
  var dbsetup = 0;
  var textToWrite;

  //dbfunctions

  function openDb(DB_NAME, DB_STORE_NAME) {
    console.log("EBCH: Preparing DB.");
    var req = indexedDB.open(DB_NAME, 1);
    req.onsuccess = function (evt) {
      // Equal to: db = req.result;
      db = this.result;
      console.log("EBCH: DB Ready.");
      dbsetup = 1;
    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("EBCH: DB Update Process.");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
  }

  function adddata(type, sender, text, DB_STORE_NAME) {
    if (debug === 1) {console.log("add database.", arguments);}
    const datenow = new Date(Date.now());
    var obj = { logmsg: "[" + datenow.toLocaleDateString() + " - " + datenow.toLocaleTimeString() + " - " + Player.LastChatRoom + "] (" + sender + " - " + type + ") " + text } ;
    if (typeof blob != 'undefined')
      obj.blob = blob;
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(obj);
    } catch (e) {
      if (e.name == 'DataCloneError')
      throw e;
    }
    req.onsuccess = function (evt) {
      if(debug === 1) {console.log("EBCH: DB Insertion worked.");}
    };
    req.onerror = function() {
      if(debug === 1) {console.log("EBCH: DB Insertion error.");}
    };
  }

  function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  function clearObjectStore(DB_STORE_NAME) {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.clear();
    req.onsuccess = function(evt) {
      ChatRoomSendLocal("EBCH: Database " + DB_STORE_NAME + " cleared successfully.");
    };
    req.onerror = function (evt) {
      console.error("clearObjectStore:", evt.target.errorCode);
    };
  }

  function retrieveAll(DB_STORE_NAME) {
      var store = getObjectStore(DB_STORE_NAME, 'readwrite');
      var msgs = [];
      store.openCursor().onsuccess = async function(event) {
      var cursor = event.target.result;
      if (cursor) {
      msgs = msgs + JSON.stringify(Object.values(cursor.value)[0]) + " \n";
      cursor.continue();
      } else {
    textToWrite = msgs;
    ChatRoomSendLocal("EBCH: Data Retrieved. Preparing and formatting text file...");
    saveTextAsFileCont();
      }
    };

  }

     function saveTextAsFile()
{
    var store = "logs" + JSON.stringify(Player.MemberNumber);
    ChatRoomSendLocal("EBCH: Retrieving data from DB. This may take a while.");
    retrieveAll(store);

}

  function saveTextAsFileCont() {
    if(textToWrite === "") {return ChatRoomSendLocal("EBCH: No content to output, exiting export function.");}
    //textToWrite = textToWrite.replaceAll('"',"");
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    const datenow = new Date(Date.now());
    var fileNameToSaveAs = "BC ChatLog " + JSON.stringify(Player.Name) + " - " + datenow.toLocaleDateString() + " - " + datenow.toLocaleTimeString();
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    ChatRoomSendLocal("EBCH: Sending file.");
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
    textToWrite = "";
  }

  //end of db functions

  document.addEventListener('visibilitychange', function (event) {
    if (document.hidden) {
        focus = 0;
    } else {
        focus = 1;
    }
  });


  await waitFor(() => ServerIsConnected && ServerSocket);

  function targetfind(input) {
    var targetnumber = parseInt(input);
    var target;
    if(targetnumber >= 0)
    {
      target = ChatRoomCharacter.find((x) => x.MemberNumber === targetnumber);
    } else {
      target = ChatRoomCharacter.find((x) => x.Name === input.trim());
    }
    return target;
  }

  function Act(P, AG, AN) {
    if(debug === 1) console.log("Trying to boop ", P);
    // ensure activity is allowed and is not being done on player
    if (!ActivityAllowedForGroup(P, AG).some(a => a.Name == AN)) return;
    var Dictionary = [];
    Dictionary.push({ Tag: "SourceCharacter", Text: Player.Name, MemberNumber: Player.MemberNumber });
    Dictionary.push({ Tag: "TargetCharacter", Text: P.Name, MemberNumber: P.MemberNumber });
    Dictionary.push({ Tag: "ActivityGroup", Text: AG });
    Dictionary.push({ Tag: "ActivityName", Text: AN });
    ServerSend("ChatRoomChat", { Content: ((P.ID == 0) ? "ChatSelf-" : "ChatOther-") + AG + "-" + AN, Type: "Activity", Dictionary: Dictionary });
  }

  function Pose(tar, pose){
    if(CharacterCanChangeToPose(tar, pose) && !tar.BlackList.includes(Player.MemberNumber) && (tar.ItemPermission <=2 || tar.ID == 0 || tar.IsLoverOfPlayer() || tar.IsOwnedByPlayer() || tar.WhiteList.includes(Player.MemberNumber))){
      CharacterSetActivePose(tar, pose);
      ChatRoomCharacterUpdate(tar);
    if(pose === "Yoked") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " raises " + tar.Name + "'s hands."}]});
    } else if (pose === "BaseLower") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " helps " + tar.Name + " up on their feet."}]});
    } else if (pose === "BaseUpper") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " lets " + tar.Name + " relax their arms."}]});
    } else if (pose === "KneelingSpread") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " lowers " + tar.Name + " on their knees, forcing their legs open."}]});
    } else if (pose === "Kneel") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " lowers " + tar.Name + " on their knees."}]});
    } else if (pose === "OverTheHead") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " forcibly raises " + tar.Name + "'s hands above their head."}]});
    } else if (pose === "Hogtied") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " lowers " + tar.Name + " on their belly."}]});
    } else if (pose === "AllFours") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " forces " + tar.Name + " on all fours."}]});
    } else if (pose === "BackBoxTie") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " draws " + tar.Name + "'s arms behind their back."}]});
    } else if (pose === "LegsClosed") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " helps " + tar.Name + " stand straight with their legs closed."}]});
    } else if (pose === "Spread") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " forces " + tar.Name + " to spread their legs."}]});
    } else if (pose === "BackElbowTouch") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " draws " + tar.Name + "'s arms tight behind their back, elbows almost touching."}]});
    } else if (pose === "LegsOpen") {
      ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: Player.Name + " helps " + tar.Name + " stand straight with their legs open."}]});
    }
    } else {
      ChatRoomSendLocal("EBCH: " + tar.Name + " cannot be set to " + pose + " at the moment.");
    }
    return;
  }

  function Save() {
    //debug,antigarble
    if(debug === 1) {console.log("saving settings");}
    var sdebug;
    var sungarble;
    var slogging;
    var sHW;
    var sNW;
    var sN;
    var ebchsettings;
    if(JSON.stringify(debug) === null)
    {
      sdebug = "0";
    } else {
      sdebug = JSON.stringify(debug);
    }
    if(JSON.stringify(ungarble) === null)
    {
      sungarble = "0";
    } else {
      sungarble = JSON.stringify(ungarble);
    }
    if(JSON.stringify(logging) === null)
    {
      slogging = "0";
    } else {
      slogging = JSON.stringify(logging);
    }
    if(JSON.stringify(notifs) === null)
    {
      sN = "0";
    } else {
      sN = JSON.stringify(notifs);
    }
    if(JSON.stringify(HearingWhitelist) === null) {
      sHW = "";
    } else {
      sHW = JSON.stringify(HearingWhitelist);
    }
    if(JSON.stringify(notifwords) === null) {
      sNW = "";
    } else {
      sNW = JSON.stringify(notifwords);
    }
    ebchsettings =  sdebug + "," + sungarble + "," + slogging + "," + sN + "|" + sHW + "|" + sNW;
    ebchsettings = ebchsettings.replaceAll("[","");
    ebchsettings = ebchsettings.replaceAll("]","");
    Player.OnlineSettings.EBCH = ebchsettings;
    ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings })
  }

  function Load() {
    if(Player.OnlineSettings.EBCH !== undefined) {
    if(debug === 1) {console.log("loading settings");}
      var ebchsettings = Player.OnlineSettings.EBCH;
      ebchsettings = ebchsettings.replace("/g","");
      ebchsettings = ebchsettings.replaceAll('"',"");
      console.log(ebchsettings);
      if(ebchsettings !== ""){
        var setlist = ebchsettings.split("|");
        var wl = setlist[1];
        if(wl !== "" && wl !== undefined) {
          HearingWhitelist = wl.split(",");
          HearingWhitelist = HearingWhitelist.map((x) => +x);
        } else {
          HearingWhitelist = [];
        }
        var nw = setlist[2];
        if(nw !== "" && nw !== undefined) {
          notifwords = nw.split(",");
        } else {
          notifwords = [];
        }
        var settings = setlist[0].split(",");
        debug = parseInt(settings[0]);
        ungarble = parseInt(settings[1]);
        logging = parseInt(settings[2]);
        notifs = parseInt(settings[3]);
      }
    }
  }




    // users in the chatroom are stored in ChatRoomCharacter array
  // on channel join data Type is Action, Content is ServerEnter and MemberNumber is the joining user
  ServerSocket.on("ChatRoomMessage", async (data) => {

    if(debug === 1) console.log("ChatRoomMessageBit", data);

    // if the data is not a ServerEnter, return
    if (data.Content !== "ServerEnter" && data.Type !== "Chat" && data.Type !== "Action" && data.Type !== "Activity" && data.Type !== "Emote" && data.Type !== "Whisper") {
      return;
    }
    //load settings when entering chatroom
    if(data.Content === "ServerEnter" && data.Sender === Player.MemberNumber) {
      ChatRoomSendLocal("EBCH: !ebchhelp for commands.");
      Load();
      if(dbsetup === 0) {openDb("BCLogs"+ JSON.stringify(Player.MemberNumber), "logs" + JSON.stringify(Player.MemberNumber));}
    }
    if(data.Type === "Chat" && focus === 0 && notifs === 1) {
      for (const P of notifwords) {
        let index = data.Content.search(P);
        if(index !== -1) {
          NotificationRaise("ChatMessage", data.Content);
        }

      }
    }
    if((data.Type === "Chat" || data.Type === "Emote"  || data.Type === "Whisper" || data.Type === "Action" || data.Type === "Activity") && logging === 1) {
      var char = targetfind(data.Sender);
      if(dbsetup === 1) {adddata(data.Type, char.Name, data.Content, "logs" + JSON.stringify(Player.MemberNumber));}
    }


    return;
  });



  async function waitFor(func, cancelFunc = () => false) {
    while (!func()) {
      if (cancelFunc()) {
        if(debug === 1) console.log("waitFor returning false.");
        return false;
      }
      if(debug === 1) console.log("waitFor sleep bit.");
      await sleep(100);
    }
    if(debug === 1) console.log("waitFor returning true.");
    return true;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function antiGarbling() {
      await waitFor(() => !!SpeechGarble);
      modApi.hookFunction('SpeechGarble', 4, (args, next) => {
        // Copy original, which is second argument
        const originalText = args[1];
        const source = args[0];
        // Call the original function, saving result
        const garbledText = next(args);
        // Return modified result by adding original text after the garbled text
        if(originalText.indexOf("(") !== 0 &&  SpeechGetTotalGagLevel(source) >= 1 && ungarble !== 0 && (HearingWhitelist.includes(source.MemberNumber) || ungarble === 2 || HearingWhitelist == source.MemberNumber))
        {
          return originalText + " (Ungarbled)";
        } else if(originalText.indexOf("(") === 0 &&  SpeechGetTotalGagLevel(source) >= 1 && ungarble !== 0 && (HearingWhitelist.includes(source.MemberNumber) || ungarble === 2 || HearingWhitelist == source.MemberNumber)){
          return originalText;
        } else {
          return garbledText;
        }
        //return garbledText + ' <> ' + originalText;
      });
    }

  async function crCommands() {
    await waitFor(() => !!ChatRoomSendChat);

    modApi.hookFunction("ChatRoomSendChat", 4, (args, next) => {
      //console.log("CRSC Triggered.");
      const placeholder = InputChat.placeholder;
      var msg = ElementValue("InputChat").trim();
      //Add to whitelist

      if(placeholder.indexOf("Whisper") == 0 && logging === 1) {
        var char = targetfind(Player.MemberNumber);
        if(dbsetup === 1) {adddata(placeholder, char.Name, msg, "logs" + JSON.stringify(Player.MemberNumber));}
      }
      if(msg.startsWith("!")) {
        if(msg.indexOf("!downloadlogs") === 0) {
          ChatRoomSendLocal("EBCH: Preparing export.");
          saveTextAsFile();
          msg = "";
          ElementValue("InputChat","");
          return;

        }
        else if(msg.indexOf("!clearlogs") === 0) {
          ChatRoomSendLocal("EBCH: Attempting to clear database.");
          var store = "logs" + JSON.stringify(Player.MemberNumber);
          clearObjectStore(store);
          msg = "";
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!notifadd") == 0) {
          subs = msg.substring(10).trim();
          msg = "";
          if(subs !== "") {
          notifwords.push(subs);
          ChatRoomSendLocal("EBCH: Added " + subs + " to the notification words.");
          Save();
          } else {
          ChatRoomSendLocal("EBCH: No word found.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!notifremove") == 0) {
          subs = msg.substring(13).trim();
          msg = "";
          if(notifwords.includes(subs) && subs !== "") {
            var index = notifwords.indexOf(subs);
            if(index > -1) {
              notifwords.splice(index,1);
              ChatRoomSendLocal("EBCH: Removed " + subs + " from the notification words.");
              Save();
            }
          } else {
            ChatRoomSendLocal("EBCH: Notification Word not found in the list or no word was passed.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!notifclear") == 0) {
          notifwords = [];
          ChatRoomSendLocal("EBCH: Notification Words cleared.");
          Save();
          msg = "";
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!notiflist") == 0) {
          ChatRoomSendLocal("EBCH: Notification Words: " + notifwords);
          msg = "";
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!hearingwhitelistadd") == 0)
        {
            subs = msg.substring(21).trim();
            msg = "";
            var target = targetfind(subs);
            if(target !== "" || target !== null || !HearingWhitelist.includes(target.MemberNumber)) {
            HearingWhitelist.push(target.MemberNumber);
            ChatRoomSendLocal("EBCH: Added " + target.Name + " to the hearing whitelist.");
            Save();
          } else {
            ChatRoomSendLocal("EBCH: Couldn't find target in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!hearingwhitelistremove") == 0)
        {
            subs = msg.substring(24).trim();
            subs = parseInt(subs);
            msg = "";
            if(HearingWhitelist.includes(subs)) {
            var index = HearingWhitelist.indexOf(subs);
            if(index > -1)
            {
              HearingWhitelist.splice(index,1);
              ChatRoomSendLocal("EBCH: Removed " + subs + " from the hearing whitelist.");
              Save();
            }

          } else {
            ChatRoomSendLocal("EBCH: Couldn't find target in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        //list whitelist
        else if(msg.indexOf("!hearingwhitelistclear") == 0) {
          HearingWhitelist = [];
          ChatRoomSendLocal("Hearing Whitelist Cleared");
          msg = "";
          Save();
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!hearingwhitelist") == 0) {
          ChatRoomSendLocal("Hearing Whitelist: " + HearingWhitelist);
          msg = "";
          ElementValue("InputChat","");
          return;
        }

        //Actions
        else if(msg.indexOf("!pet") == 0)
        {
          subs = msg.substring(5).trim();
          msg = "";
          if(subs === "")
          {
            for (const P of ChatRoomCharacter) {
              if(P !== Player && P)
              {
                Act(target, "ItemHead", "Pet");
              }
            }
          } else {
            var target = targetfind(subs);
            if(target){
              Act(target, "ItemHead", "Pet");
            } else {
              ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
            }
          }
          ElementValue("InputChat","");
          return;
        }
        //poses
        else if(msg.indexOf("!yoked") == 0)
        {
          subs = msg.substring(7).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "Yoked");
          } else if(subs === "") {
            Pose(Player, "Yoked");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }

        else if(msg.indexOf("!stand") == 0)
        {
          subs = msg.substring(7).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "BaseLower");
          } else if(subs === "") {
            Pose(Player, "BaseLower");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!basehands") == 0)
        {
          subs = msg.substring(11).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "BaseUpper");
          } else if(subs === "") {
            Pose(Player, "BaseUpper");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!kneelspread") === 0)
        {
          subs = msg.substring(13).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "KneelingSpread");
          } else if(subs === "") {
            Pose(Player, "KneelingSpread");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!kneel") == 0)
        {
          subs = msg.substring(7).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "Kneel");
          } else if(subs === "") {
            Pose(Player, "Kneel");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!overhead") == 0)
        {
          subs = msg.substring(10).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "OverTheHead");
          } else if(subs === "") {
            Pose(Player, "OverTheHead");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!hogtied") == 0)
        {
          subs = msg.substring(9).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "Hogtied");
          } else if(subs === "") {
            Pose(Player, "Hogtied");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!allfours") == 0)
        {
          subs = msg.substring(10).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "AllFours");
          } else if(subs === "") {
            Pose(Player, "AllFours");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!backboxtie") == 0)
        {
          subs = msg.substring(12).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "BackBoxTie");
          } else if(subs === "") {
            Pose(Player, "BackBoxTie");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!legsclosed") == 0)
        {
          subs = msg.substring(11).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "LegsClosed");
          } else if(subs === "") {
            Pose(Player, "LegsClosed");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!spread") == 0)
        {
          subs = msg.substring(8).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "Spread");
          } else if(subs === "") {
            Pose(Player, "Spread");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!backtight") == 0)
        {
          subs = msg.substring(11).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "BackElbowTouch");
          } else if(subs === "") {
            Pose(Player, "BackElbowTouch");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!legsopen") == 0)
        {
          subs = msg.substring(10).trim();
          msg = "";
          var target = targetfind(subs);
          if(target){
            Pose(target, "LegsOpen");
          } else if(subs === "") {
            Pose(Player, "LegsOpen");
          } else {
            ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
          }
          ElementValue("InputChat","");
          return;
        }
        //ungarble command
        else if (msg === "!ungarble")
        {
          msg = "";
          if(ungarble === 0)
          {
            ungarble = 1;
            ChatRoomSendLocal("Ungarble turned on (Hearing Whitelist).");
            Save();
          }
          else if (ungarble === 1)
          {
            ungarble = 2;
            ChatRoomSendLocal("Ungarble turned on (all).");
            Save();
          }
          else
          {
            ungarble = 0;
            ChatRoomSendLocal("Ungarble turned off.");
            Save();
          }
          ElementValue("InputChat","");
          return;

        }
        else if(msg.indexOf("!logging") == 0) {
          if(logging === 0) {
            logging = 1;
            ChatRoomSendLocal("EBCH: Chatlogging turned on.");
            msg = "";
            if(dbsetup === 0) {openDb("BCLogs"+ JSON.stringify(Player.MemberNumber), "logs" + JSON.stringify(Player.MemberNumber));}
            Save();
          } else {
            logging = 0;
            ChatRoomSendLocal("EBCH: Chatlogging off.");
            msg = "";
            Save();
          }
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!notifs") == 0) {
          if(notifs === 0) {
            notifs = 1;
            ChatRoomSendLocal("EBCH: Notifications turned on.");
            msg = "";
            Save();
          } else {
            notifs = 0;
            ChatRoomSendLocal("EBCH: Notifications turned off.");
            msg = "";
            Save();
          }
          ElementValue("InputChat","");
          return;
        }
        else if (msg.indexOf("!wardrobe") == 0) {
              var targetnumberstr = msg.substring(10).trim();
              msg = "";
              var target = targetfind(targetnumberstr);

              if(target !== undefined)
              {
                ChatRoomClickCharacter(target);
                ChatRoomChangeClothes();
              } else if (targetnumberstr === "") {
                ChatRoomClickCharacter(Player);
                ChatRoomChangeClothes();
              } else {
                ChatRoomSendLocal("Error: Unable to find " + targetnumberstr + " in chatroom.");
              }
              ElementValue("InputChat","");
              return;
            }
          else if (msg === "!Debug")
          {
            msg = "";
            if(debug === 0)
            {
              debug = 1;
              ChatRoomSendLocal("Debug = 1.");
            } else {
              debug = 0;
              ChatRoomSendLocal("Debug = 0.");

            }
            ElementValue("InputChat","");
            return;
          }
        else if(msg.indexOf("!ebchhelp") === 0) {
          msg = "";
          ChatRoomSendLocal("Welcome to EBCH! Script written by Elicia with the help of Sid\nHelp commands:\n!ebchhelp: this help menu.\n!ebchposehelp: displays all the available pose commands.\n!ebchlogginghelp: displays all the chatlogging related commands.\n!ebchnotifhelp: displays all the notification related commands.\n!ebchungarblehelp: displays all the ungarble related commands.");
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!ebchposehelp") === 0) {
          msg = "";
          ChatRoomSendLocal("Format: !pose name or !pose membernumber, using the pose on its own will target the player.\n ie: !yoked Elicia or simply !yoked.\n!stand,!basehands,!kneel,!kneelspread,!yoked,!overhead,!hogtied,!allfours,!backboxtie,!legsclosed,!legsopen,!spread,!backtight,");
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!ebchlogginghelp") === 0) {
          msg = "";
          ChatRoomSendLocal("Chatlogs are handled individually for each character. Logging commands:\n!logging: switches chatlogging on and off.\n!downloadlogs: Prepares the logs in a textfile and sends it to the user.\n!clearlogs: clears the logs associated to the current character.");
          ElementValue("InputChat","");
          return;
        }
        else if(msg.indexOf("!ebchnotifhelp") === 0) {
          msg = "";
          ChatRoomSendLocal("Notifs will only trigger while you are tabbed out.\nAllows you to set a list of words that will trigger notifs in local chat.\n!notifs: Turn notifications related to this script on/off.\n!notifadd: Adds a word to the notification list.\n!notifremove: removes a word from the notification list.\n!notifclear: clears the notification list.\n!notiflist: lists the words that will trigger a notification.");
          ElementValue("InputChat","");
          return;

        }
        else if(msg.indexOf("!ebchungarblehelp") === 0) {
          msg = "";
          ChatRoomSendLocal("Ungarble has 3 settings: Off, Hearing Whitelist, and all. Commands work with both name and number.\n!ungarble: toggles between the ungarble modes.\n!hearingwhitelistadd: allows you to add someone in your chatroom to your ungarble list.\n!hearingwhitelistremove: removes someone from your hearing whitelist. Only works with numbers.\n!hearingwhitelistclear: clears the ungarble list.\n!hearingwhitelist: lists your ungarbled people.");
          ElementValue("InputChat","");
          return;
        } else {
          return next(args);
        }
      } else if (msg === "") {
        return;
      } else {
        return next(args);
      }


    })

  }

})();
