// ==UserScript==
// @name Eli's BC Helper
// @namespace https://www.bondageprojects.com/
// @version 0.1
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




(async function () {
  var HearingWhitelist = [];
  var notifwords = [];
  const GAGBYPASSINDICATOR = "\uf123";
  var ungarble = 0;
  antiGarbling();
  crFontSize();
  crCommands();
  cbFontSize();
  var debug = 0;
  var focus = 1;
  var logging = 0;
  var notifs = 0;
  var textFile = null;
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
			store.openCursor().onsuccess = function(event) {
  		var cursor = event.target.result;
  		if (cursor) {
  		
    	msgs = msgs + JSON.stringify(Object.values(cursor.value)[0]) + "\n";
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
		textToWrite = textToWrite.replaceAll('"',"");
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
    if(CharacterCanChangeToPose(tar, pose)){
      CharacterSetActivePose(tar, pose);
      ChatRoomCharacterUpdate(tar);
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
			ebchsettings = ebchsettings.replace(/"/g,"");
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
      const bc_SpeechGarble = SpeechGarble;
      SpeechGarble = function (C, CD, IgnoreOOC) {
        //console.log("SpeechGarbleTriggered.");
        let garbled = bc_SpeechGarble(C, CD, IgnoreOOC).replace(
          GAGBYPASSINDICATOR,
          ""
        );
        if (CD?.trim().endsWith(GAGBYPASSINDICATOR)) {
          return CD.replace(/[\uE000-\uF8FF]/g, "");
        } else if (SpeechGetTotalGagLevel(C) >= 1 && ungarble !== 0 && (HearingWhitelist.includes(C.MemberNumber) || ungarble === 2 || HearingWhitelist == C.MemberNumber)) {
          return garbled.toLowerCase() === CD?.toLowerCase()
            ? garbled
            : `${CD} (Ungarbled)`;

        }
        return garbled;
      };
    }

  async function crFontSize() {
    await waitFor(() => !!ElementPositionFix);
    const EPF = ElementPositionFix;
    //ElementPositionFix("TextAreaChatLog", ChatRoomFontSize, 1005, 5, 988, 859);
    ElementPositionFix = function (ElementID, Font, X, Y, W, H) {
      //console.log("EPF Triggered.");
      if(ElementID === "TextAreaChatLog" && CurrentScreen === "ChatRoom" && (Player.MemberNumber === 10831 || Player.MemberNumber === 54108))
      {
        let EPFfix = EPF(ElementID, 20, X, Y, W, H);
        if(debug === 1) console.log("Chat Log Font Size Fix.");
        return EPFfix;
      }
      else if(ElementID === "FriendList")
      {
        let EPFfix = EPF(ElementID, 28, X, Y, W, H);
        return EPFfix;
      }

      let EPFCS = EPF(ElementID, Font, X, Y, W, H);
      return EPFCS;

    }
  }

  async function cbFontSize() {
    await waitFor(() => !!ElementPosition);
    const EP = ElementPosition;
    ElementPosition = function (ElementID, X, Y, W, H) {
      //console.log("EP Triggered.");
      if(ElementID === "InputChat" && (Player.MemberNumber === 10831 || Player.MemberNumber === 54108))
      {
        if(debug === 1) console.log("Chat Box Font Size Fix.")
        return ElementPositionFix(ElementID, 24, X * 0.691, Y * 0.957, W * 0.98, H * 0.99);
      }
      let EPCS = EP(ElementID, X, Y, W, H);
      return EPCS;
    }
  }

  async function crCommands() {
    await waitFor(() => !!ChatRoomSendChat);
    const CRSC = ChatRoomSendChat;
    ChatRoomSendChat = function (){
      //console.log("CRSC Triggered.");
      const placeholder = InputChat.placeholder;
      const msg = ElementValue("InputChat").trim();
      var msgproc = msg;
      //Add to whitelist
      if(placeholder.indexOf("Whisper") == 0 && logging === 1) {
      	var char = targetfind(Player.MemberNumber);
  			if(dbsetup === 1) {adddata(placeholder, char.Name, msgproc, "logs" + JSON.stringify(Player.MemberNumber));}
      }
      if(msgproc.indexOf("!downloadlogs") === 0) {
      	ChatRoomSendLocal("EBCH: Preparing export.");
      	saveTextAsFile();
      	msgproc = "";
      	
      }
      if(msgproc.indexOf("!clearlogs") === 0) {
      	ChatRoomSendLocal("EBCH: Attempting to clear database.");
      	var store = "logs" + JSON.stringify(Player.MemberNumber);
      	clearObjectStore(store);
      	msgproc = "";
      }
      if(msgproc.indexOf("!notifadd") == 0) {
      	subs = msgproc.substring(10).trim();
      	msgproc = "";
      	if(subs !== "") {
      	notifwords.push(subs);
      	ChatRoomSendLocal("EBCH: Added " + subs + " to the notification words.");
      	Save();
      	} else {
      	ChatRoomSendLocal("EBCH: No word found.");
      	}
      }
      if(msgproc.indexOf("!notifremove") == 0) {
      	subs = msgproc.substring(13).trim();
      	msgproc = "";
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
      }
      if(msgproc.indexOf("!notifclear") == 0) {
      	notifwords = [];
      	ChatRoomSendLocal("EBCH: Notification Words cleared.");
      	Save();
      	msgproc = "";
      }
      if(msgproc.indexOf("!notiflist") == 0) {
      	ChatRoomSendLocal("EBCH: Notification Words: " + notifwords);
      	msgproc = "";
      }
      if(msgproc.indexOf("!hearingwhitelistadd") == 0)
      {
      		subs = msgproc.substring(21).trim();
      		msgproc = "";
      		var target = targetfind(subs);
      		if(target !== "" || target !== null || !HearingWhitelist.includes(target.MemberNumber)) {
      		HearingWhitelist.push(target.MemberNumber);
      		ChatRoomSendLocal("EBCH: Added " + target.Name + " to the hearing whitelist.");
      		Save();
      	} else {
      		ChatRoomSendLocal("EBCH: Couldn't find target in chatroom.");
      	}
      }
      if(msgproc.indexOf("!hearingwhitelistremove") == 0)
      {
      		subs = msgproc.substring(24).trim();
      		subs = parseInt(subs);
      		msgproc = "";
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
      }
      //list whitelist
      if(msgproc.indexOf("!hearingwhitelistclear") == 0) {
      	HearingWhitelist = [];
      	ChatRoomSendLocal("Hearing Whitelist Cleared");
      	msgproc = "";
      	Save();
      }
      if(msgproc.indexOf("!hearingwhitelist") == 0) {
      	ChatRoomSendLocal("Hearing Whitelist: " + HearingWhitelist);
      	msgproc = "";
      }

      //Actions
      if(msgproc.indexOf("!pet") == 0)
      {
        subs = msgproc.substring(5).trim();
        msgproc = "";
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
      }
      //poses
      if(msgproc.indexOf("!yoked") == 0)
      {
        subs = msgproc.substring(7).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "Yoked");
        } else if(subs === "") {
          Pose(Player, "Yoked");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }

      if(msgproc.indexOf("!stand") == 0)
      {
        subs = msgproc.substring(7).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "BaseLower");
        } else if(subs === "") {
          Pose(Player, "BaseLower");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!basehands") == 0)
      {
        subs = msgproc.substring(11).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "BaseUpper");
        } else if(subs === "") {
          Pose(Player, "BaseUpper");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!kneelspread") === 0)
      {
        subs = msgproc.substring(13).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "KneelingSpread");
        } else if(subs === "") {
          Pose(Player, "KneelingSpread");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!kneel") == 0)
      {
        subs = msgproc.substring(7).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "Kneel");
        } else if(subs === "") {
          Pose(Player, "Kneel");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!overhead") == 0)
      {
        subs = msgproc.substring(10).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "OverTheHead");
        } else if(subs === "") {
          Pose(Player, "OverTheHead");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!hogtied") == 0)
      {
        subs = msgproc.substring(9).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "Hogtied");
        } else if(subs === "") {
          Pose(Player, "Hogtied");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!allfours") == 0)
      {
        subs = msgproc.substring(10).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "AllFours");
        } else if(subs === "") {
          Pose(Player, "AllFours");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!backboxtie") == 0)
      {
        subs = msgproc.substring(12).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "BackBoxTie");
        } else if(subs === "") {
          Pose(Player, "BackBoxTie");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!legsclosed") == 0)
      {
        subs = msgproc.substring(11).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "LegsClosed");
        } else if(subs === "") {
          Pose(Player, "LegsClosed");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!spread") == 0)
      {
        subs = msgproc.substring(8).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "Spread");
        } else if(subs === "") {
          Pose(Player, "Spread");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!backtight") == 0)
      {
        subs = msgproc.substring(11).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "BackElbowTouch");
        } else if(subs === "") {
          Pose(Player, "BackElbowTouch");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      if(msgproc.indexOf("!legsopen") == 0)
      {
        subs = msgproc.substring(10).trim();
        msgproc = "";
        var target = targetfind(subs);
        if(target){
          Pose(target, "LegsOpen");
        } else if(subs === "") {
          Pose(Player, "LegsOpen");
        } else {
          ChatRoomSendLocal("EBCH: Unable to find " + subs + " in chatroom.");
        }
      }
      //ungarble command
      if (msgproc === "!ungarble")
      {
        msgproc = "";
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

      }
      if(msgproc.indexOf("!logging") == 0) {
      	if(logging === 0) {
      		logging = 1;
      		ChatRoomSendLocal("EBCH: Chatlogging turned on.");
      		msgproc = "";
      		if(dbsetup === 0) {openDb("BCLogs"+ JSON.stringify(Player.MemberNumber), "logs" + JSON.stringify(Player.MemberNumber));}
      		Save();
      	} else {
      		logging = 0;
      		ChatRoomSendLocal("EBCH: Chatlogging off.");
      		msgproc = "";
      		Save();
      	}
      }
      if(msgproc.indexOf("!notifs") == 0) {
      	if(notifs === 0) {
      		notifs = 1;
      		ChatRoomSendLocal("EBCH: Notifications turned on.");
      		msgproc = "";
      		Save();
      	} else {
      		notifs = 0;
      		ChatRoomSendLocal("EBCH: Notifications turned off.");
      		msgproc = "";
      		Save();
      	}
      }
      if (msgproc.indexOf("!wardrobe") == 0) {
            var targetnumberstr = msgproc.substring(10).trim();
            msgproc = "";
            var target = targetfind(targetnumberstr);

            if(target !== undefined)
            {
            	target.OnlineSharedSettings.AllowFullWardrobeAccess = true;
              target.OnlineSharedSettings.BlockBodyCosplay = false;
              ChatRoomClickCharacter(target);
              ChatRoomChangeClothes();
            } else if (targetnumberstr === "") {
              ChatRoomClickCharacter(Player);
              ChatRoomChangeClothes();
            } else {
              ChatRoomSendLocal("Error: Unable to find " + targetnumberstr + " in chatroom.");
            }
          }
        if (msgproc === "!Debug")
        {
          msgproc = "";
          if(debug === 0)
          {
            debug = 1;
            ChatRoomSendLocal("Debug = 1.");
          } else {
            debug = 0;
            ChatRoomSendLocal("Debug = 0.");
          }
        }
      if(msgproc.indexOf("!ebchhelp") === 0) {
      	msgproc = "";
      	ChatRoomSendLocal("Welcome to EBCH! Script written by Elicia with the help of Sid\nHelp commands:\n!ebchhelp: this help menu.\n!ebchposehelp: displays all the available pose commands.\n!ebchlogginghelp: displays all the chatlogging related commands.\n!ebchnotifhelp: displays all the notification related commands.\n!ebchungarblehelp: displays all the ungarble related commands.");
      }
      if(msgproc.indexOf("!ebchposehelp") === 0) {
      msgproc = "";
      ChatRoomSendLocal("Format: !pose name or !pose membernumber, using the pose on its own will target the player.\n ie: !yoked Elicia or simply !yoked.\n!stand,!basehands,!kneel,!kneelspread,!yoked,!overhead,!hogtied,!allfours,!backboxtie,!legsclosed,!legsopen,!spread,!backtight,");
      }
      if(msgproc.indexOf("!ebchlogginghelp") === 0) {
      	msgproc = "";
      	ChatRoomSendLocal("Chatlogs are handled individually for each character. Logging commands:\n!logging: switches chatlogging on and off.\n!downloadlogs: Prepares the logs in a textfile and sends it to the user.\n!clearlogs: clears the logs associated to the current character.");
      }
      if(msgproc.indexOf("!ebchnotifhelp") === 0) {
      	msgproc = "";
      	ChatRoomSendLocal("Notifs will only trigger while you are tabbed out.\nAllows you to set a list of words that will trigger notifs in local chat.\n!notifs: Turn notifications related to this script on/off.\n!notifadd: Adds a word to the notification list.\n!notifremove: removes a word from the notification list.\n!notifclear: clears the notification list.\n!notiflist: lists the words that will trigger a notification.");
      }
      if(msgproc.indexOf("!ebchungarblehelp") === 0) {
      msgproc = "";
      ChatRoomSendLocal("Ungarble has 3 settings: Off, Hearing Whitelist, and all. Commands work with both name and number.\n!ungarble: toggles between the ungarble modes.\n!hearingwhitelistadd: allows you to add someone in your chatroom to your ungarble list.\n!hearingwhitelistremove: removes someone from your hearing whitelist. Only works with numbers.\n!hearingwhitelistclear: clears the ungarble list.\n!hearingwhitelist: lists your ungarbled people.");
      }  
      if (msgproc != "") {

      // Keeps the chat log in memory so it can be accessed with pageup/pagedown
      ChatRoomLastMessage.push(msgproc);
      ChatRoomLastMessageIndex = ChatRoomLastMessage.length;

      CommandParse(msgproc);
      return;
      }
      return ElementValue("InputChat", "");


    }

  }

})();
