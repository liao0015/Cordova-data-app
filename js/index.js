var occasionList = document.getElementById("occasion-list");
var peopleList = document.getElementById("people-list");
var occasionGift = document.getElementById("gifts-for-occasion");
var peopleGift = document.getElementById("gifts-for-person");
var modals = document.querySelectorAll("[data-role=modal]");
var btnSave = document.querySelectorAll(".btnSave");

var occList = document.getElementById("list-occ");
var perList = document.getElementById("list-per");
var db = null;

var doubleIndexNum;
var indexNum;
var personId;//track person_id
var occasionId;//track occ_id
document.addEventListener("DOMContentLoaded", onDeviceReady, false);
//document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	checkDB();
	btnSave[0].addEventListener("click", addNewDataPerson);
	btnSave[1].addEventListener("click", addNewDataOccasion);
	btnSave[2].addEventListener("click", addNewDataPersonGift);
	btnSave[3].addEventListener("click", addNewDataOccasionGift);
}

function checkDB(){
    db = openDatabase('newPad', '', 'DataApp newpad', 1024*1024);
    if(db.version == ''){
        console.info('First time running... create tables'); 
        db.changeVersion('', '1.0',
                function(trans){
                    console.info("DB version incremented");
                    trans.executeSql('CREATE TABLE people(person_id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT)', [], 
                                    function(tx, rs){
                                        console.info("Table stuff created");
                                    },
                                    function(tx, err){
                                        console.info( err.message);
                                    });
                    trans.executeSql('CREATE TABLE occasions(occ_id INTEGER PRIMARY KEY AUTOINCREMENT, occ_name TEXT)', [], 
                                    function(tx, rs){
                                        console.info("Table occasion created");
                                    },
                                    function(tx, err){
                                        console.info( err.message);
                                    });
					trans.executeSql('CREATE TABLE gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, occ_id INTEGER, gift_idea TEXT, purchased INTEGER)', [], 
									function(tx, rs){
										console.info("Table gifts created");
									},
									function(tx, err){
										console.info( err.message);
									});
                },
                function(err){
                    console.info( "error:"+err.message);
                },
                function(){
                    console.info("successfully completed the transaction of incrementing the version number");  
                });
        addEventHandlers();
    }
	else{	
        console.info('Version: ', db.version)   
        addEventHandlers();
    }
	displayPeople();
	displayOccasions();
	displayPersonGifts();
	displayOccasionGifts();
}

function addEventHandlers(){
    addHammerTapHandler();
	addHammerSwipeHandler();
	addButtonHandler();
    console.info("Added all event handlers");
}

function addNewDataPerson(ev){
	ev.preventDefault();
	var newName = document.getElementById("new-per").value;
	if(newName !== ""){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO people(person_name)VALUES (?)',[newName],
							function(tx, rs){
								console.log("Added new row in people");
								closeModal();
								displayPeople();
							},
							function(tx, err){
								console.log("failed to add new row in people: " +err.message);
							});
		},
		function(){
			console.log("The insert sql transaction failed.");
		},
		function(){
			console.log("successful");
		});
	}
	else{
		alert("Please enter a new user name");
	}
}

function addNewDataOccasion(ev){
	ev.preventDefault();
	var newOcc = document.getElementById("new-occ").value;
	if(newOcc !== ""){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO occasions(occ_name)VALUES (?)',[newOcc],
							function(tx, rs){
								console.log("Added new row in ocassion");
								closeModal();
								displayOccasions();
							},
							function(tx, err){
								console.log("failed to add new row in occasion: " +err.message);
							});
	},
	function(){
		console.log("The insert sql transaction failed.");
	},
	function(){
		console.log("successful");
	});
	}
	else{
		alert("Please enter a new occasion name");
	}
}

function addNewDataPersonGift(){
	alert("button 2");
	var newGift = document.getElementById("new-idea-occasion").value;
	var purchased=1;
	var occArray = occList.querySelectorAll("option");
	for (var i = 0; i < occArray.length; i++){
		if(occArray[i].selected == true){
			occasionId = occArray[i].value;
		}
	}
	if(newGift !== ""){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO gifts(person_id, occ_id, gift_idea, purchased)VALUES (?,?,?,?)',[indexNum, occasionId, newGift, purchased]);
		});
		closeModal();
		displayPersonGifts();
	}
	else{alert("Please enter a new gift idea");}
	console.log(occArray);
	console.log("occasion ID: "+occasionId);
	console.log("person ID: "+indexNum);
	console.log("user input: "+newGift);
}

function addNewDataOccasionGift(){
	alert("button 3");
	var newGift = document.getElementById("new-idea-person").value;
	var purchased=1;
	var perArray = perList.querySelectorAll("option");
	for (var i = 0; i < perArray.length; i++){
		if(perArray[i].selected == true){
			personId = perArray[i].value;
		}
	}
	if(newGift !== ""){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO gifts(person_id, occ_id, gift_idea, purchased)VALUES (?,?,?,?)',[personId, indexNum, newGift, purchased]);
		});
		closeModal();
		displayOccasionGifts();
	}
	else{alert("Please enter a new gift idea");}
	console.log(perArray);
	console.log("occasion ID: "+indexNum);
	console.log("person ID: "+personId);
	console.log("user input: "+newGift);
}

function displayPeople() {
    db.transaction(function(trans){
        trans.executeSql('SELECT * FROM people', [], 
            function(tx, rs){
                console.info("success on getting access to database stuff");
                var output = document.querySelectorAll("[data-role=listview]");
				var optOutput = document.getElementById("list-per");
				output[0].innerHTML = "";
				optOutput.innerHTML = "";
				for (var i = 0; i < rs.rows.length; i++){
					output[0].innerHTML += "<li data-ref="+i+">"+rs.rows.item(i).person_name+"</li>";
					optOutput.innerHTML +="<option value="+i+">"+rs.rows.item(i).person_name +"</option>";
					console.info("Display items from database stuff");
				}
            }, 
            function(tx, err){
                console.info( "error: "+err.message);
            });    
    }, transErr, transSuccess);	
}

function displayOccasions() {
    db.transaction(function(trans){
        trans.executeSql('SELECT * FROM occasions', [], 
            function(tx, rs){
                console.info("success on getting access to database occasions");
                var output = document.querySelectorAll("[data-role=listview]");
				var optOutput = document.getElementById("list-occ");
				output[1].innerHTML = "";
				optOutput.innerHTML = "";
				for (var i = 0; i < rs.rows.length; i++){
					output[1].innerHTML += "<li data-ref="+i+">"+rs.rows.item(i).occ_name+"</li>";
					optOutput.innerHTML +="<option value="+i+">"+rs.rows.item(i).occ_name +"</option>";
					console.info("Display items from database occasions");
				}
            }, 
            function(tx, err){
                console.info( "error: "+err.message);
            });    
    }, transErr, transSuccess);	
}

function displayPersonGifts(){
	console.log("passing: "+indexNum);
	db.transaction(function(trans){
        trans.executeSql('SELECT * FROM gifts WHERE person_id = ?', [indexNum], 
            function(tx, rs){
                console.info("success on getting access to database gifts");
                var output = document.querySelectorAll("[data-role=listview]");
				output[2].innerHTML = "";
				for (var i = 0; i < rs.rows.length; i++){
					output[2].innerHTML += "<li data-ref="+i+">"+rs.rows.item(i).gift_idea+"</li>";
					console.info("Display items from database gifts");
				}
            }, 
            function(tx, err){
                console.info( "error: "+err.message);
            });    
    }, transErr, transSuccess);
}

function displayOccasionGifts(){
	console.log("passing occ: "+ indexNum);
	db.transaction(function(trans){
        trans.executeSql('SELECT * FROM gifts WHERE occ_id = ?', [indexNum], 
            function(tx, rs){
                console.info("success on getting access to database gifts");
                var output = document.querySelectorAll("[data-role=listview]");
				output[3].innerHTML = "";
				for (var i = 0; i < rs.rows.length; i++){
					output[3].innerHTML += "<li data-ref="+i+">"+rs.rows.item(i).gift_name+"</li>";
					console.info("Display items from database gifts");
				}
            }, 
            function(tx, err){
                console.info( "error: "+err.message);
            });    
    }, transErr, transSuccess);
}

function transErr(tx, err){
    console.info("Error processing transaction: " + err);
}

function transSuccess(){
	console.info("successful, the end");
}


function clearDataPerson(ev){
	doubleIndexNum = ev.getAttribute("data-ref");
	++doubleIndexNum;
	--doubleIndexNum;
	db.transaction(function(tx){
		tx.executeSql('DELETE FROM people WHERE person_id = ?', [doubleIndexNum],
					function(tx, rs){
						console.info("success on getting access to database people");
						displayPeople();
					}, 
					function(tx, err){
						console.info( "error: "+err.message);
					});    
    }, transErr, transSuccess);
	console.log(ev);
	console.log(doubleIndexNum);
}


function clearDataOccasion(ev){
	doubleIndexNum = ev.getAttribute("data-ref");
	++doubleIndexNum;
	--doubleIndexNum;
	db.transaction(function(tx){
		tx.executeSql('DELETE FROM occasions WHERE occ_id = ?', [doubleIndexNum],
					function(tx, rs){
						console.info("success on getting access to database people");
						displayOccasions();
					}, 
					function(tx, err){
						console.info( "error: "+err.message);
					});    
    }, transErr, transSuccess);
}

function showName(ev){
	indexNum = ev.getAttribute("data-ref");
	++indexNum;//an error was showing that indexNum is not a number, so I did this...
	--indexNum;
	db.transaction(function(trans){
        trans.executeSql('SELECT * FROM people', [], 
            function(tx, rs){
                var span = document.getElementById("thePerson");
				var spam = document.getElementById("nowPerson");
				span.innerHTML = rs.rows.item(indexNum).person_name;
				spam.innerHTML = rs.rows.item(indexNum).person_name;
            }, 
            function(tx, err){
                console.info( "error: "+err.message);
            });    
    }, transErr, transSuccess);	
}


function showOccasion(ev){
	indexNum = ev.getAttribute("data-ref");
	++indexNum;
	--indexNum;
	db.transaction(function(trans){
		trans.executeSql('SELECT * FROM occasions', [], 
			function(tx, rs){
				var span = document.getElementById("theOccasion");
				var spam = document.getElementById("nowOccasion");
				span.innerHTML = rs.rows.item(indexNum).occ_name;
				spam.innerHTML = rs.rows.item(indexNum).occ_name;
			}, 
			function(tx, err){
				console.info( "error: "+err.message);
			});    
	}, transErr, transSuccess);	
}

//all event handlers
function addHammerTapHandler(ev){
	var tar = document.querySelectorAll("[data-role=listview]");
	var mcOne = new Hammer.Manager(tar[0], {});
	var mcTwo = new Hammer.Manager(tar[1], {});
	var mcThree = new Hammer.Manager(tar[2], {});
	var mcFour = new Hammer.Manager(tar[3], {});
	
	var singleTap = new Hammer.Tap({event: 'tap'});
	var doubleTap = new Hammer.Tap({event:'doubletap', taps:2, threshold:10, posThreshold:25});
	
	mcOne.add([doubleTap, singleTap]);
	mcTwo.add([doubleTap, singleTap]);
	mcThree.add([doubleTap, singleTap]);
	mcFour.add([doubleTap, singleTap]);
	
	doubleTap.requireFailure(singleTap);
	
	/*mcOne.on("tap", function(ev){
		alert("single tap one");
			console.log("tap target person: "+ev.target);
			document.getElementById("gifts-for-person").style.display = "block";
			document.getElementById("gifts-for-occasion").style.display = "none";
			showName(ev.target);
	});
	
	mcTwo.on("tap", function(ev){
	alert("single tap two");
			console.log("tap target occasion: "+ev.target);
			document.getElementById("gifts-for-person").style.display = "none";
			document.getElementById("gifts-for-occasion").style.display = "block";
			showOccasion(ev.target);
	});*/
	
	mcFour.on("tap", function(ev){
		if(ev.target.parentNode.parentNode.getAttribute("id") == "people-list"){
			alert("single tap one");
			console.log("tap target person: "+ev.target);
			document.getElementById("gifts-for-person").style.display = "block";
			document.getElementById("gifts-for-occasion").style.display = "none";
			showName(ev.target);
		}
		else if(ev.target.parentNode.parentNode.getAttribute("id") == "occasion-list"){
			alert("single tap two");
			console.log("tap target occasion: "+ev.target);
			document.getElementById("gifts-for-person").style.display = "none";
			document.getElementById("gifts-for-occasion").style.display = "block";
			showOccasion(ev.target);
		}
	});
	
	mcFour.on("doubletap", function(ev){
		if(ev.target.parentNode.parentNode.getAttribute("id") == "people-list"){
			alert("doubled");
			console.log(ev);
			console.log(ev.target);
			clearDataPerson(ev.target);
		}
		else if(ev.target.parentNode.parentNode.getAttribute("id") == "occasion-list"){
			alert("doubled");
			console.log(ev);
			console.log(ev.target);
			clearDataOccasion(ev.target);
		}
	});
	
}

function addHammerSwipeHandler(ev){
	var tar = document.querySelectorAll("[data-role=page]");
	var mcOne = new Hammer(tar[0], {});
	var mcTwo = new Hammer(tar[1], {});
	var mcThree = new Hammer(tar[2], {});
	var mcFour = new Hammer(tar[3], {});

	mcOne.on("swipe", function(ev){
		alert("swipe on");
		console.log(tar[0])
		console.log(ev.target)
		peopleList.style.display = "none";
		occasionList.style.display = "block";
	});
	mcTwo.on("swipe", function(ev){
		alert("swipe two");
		console.log(tar[0])
		console.log(ev.target)
		peopleList.style.display = "block";
		occasionList.style.display = "none";
	});
	mcThree.on("swipe", function(ev){
		alert("swipe three");
		peopleGift.style.display = "none";
		peopleList.style.display = "block";
	});
	mcFour.on("swipe", function(ev){
		alert("swipe four");
		occasionGift.style.display = "none";
		occasionList.style.display = "block";
	});
}

function addButtonHandler(ev){
	//handle Cancel buttons
	var btnCancel = document.querySelectorAll(".btnCancel");
		for (var i = 0; i < btnCancel.length; i++){
			btnCancel[i].addEventListener("click", closeModal);
	}
	//handle Add buttons
	var btnAdd = document.querySelectorAll(".btnAdd");
	btnAdd[0].addEventListener("click", openModalOne);
	btnAdd[1].addEventListener("click", openModalTwo);
	btnAdd[2].addEventListener("click", openModalThree);
	btnAdd[3].addEventListener("click", openModalFour);
}

function openModalOne(ev){
	modals[0].style.display = "block";
	document.querySelector("[data-role=overlay]").style.display = "block";
}

function openModalTwo(ev){
	modals[1].style.display = "block";
	document.querySelector("[data-role=overlay]").style.display = "block";
}

function openModalThree(ev){
	modals[2].style.display = "block";
	document.querySelector("[data-role=overlay]").style.display = "block";
}

function openModalFour(ev){
	modals[3].style.display = "block";
	document.querySelector("[data-role=overlay]").style.display = "block";
}

function closeModal(ev){
	modals[0].style.display = "none";
	modals[1].style.display = "none";
	modals[2].style.display = "none";
	modals[3].style.display = "none";
	document.querySelector("[data-role=overlay]").style.display = "none";
}