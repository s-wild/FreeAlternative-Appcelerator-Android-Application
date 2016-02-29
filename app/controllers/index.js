/*
 * Global Variables
 */
call_buttons = [];
var first = true;
rootURL = "http://up637415.co.uk/";
var counter = [];
// Search details
searchStorageName = "searchHistory213";
searchResultsArray = [];
searchHistoryFlag = true;

// Get displays on load, hide if necessary.
noResults = $.noResults;
noResults.hide();
yesResults = $.yesResults;
yesResults.hide();
logo = $.imageLogo; 
instructions = $.serachTitle;

numberFeedbackDialog = $.rateNumber; 

/*
 * User Search UI.    
 */ 
 var searchInputBox = Titanium.UI.createSearchBar({
	backgroundColor:'#fff',
    hintTextColor:'#777',
    backgroundFocusedColor: "red",
    color: "#000",
    showCancel:true,
    height: 60,
    width: "94%",
    top: 100,
    left: "3%",
    hintText: "E.g. 'Vodafone' or '0870070191'",
    font: { color: "#fff"},
    
});
// Focus search on load. 
searchInputBox.focus();
var previousSearchLabel = Titanium.UI.createView({
   backgroundColor:'#fff',
   top: "150",
   width:"92%",
   height:"60"
});
var previousSearchIcon = Ti.UI.createImageView({
	image:'/search_icon.png',
	left: "15",
	top: "15",
	width: "30",
	height: "30"
});  
var previousSearchLabelText = Ti.UI.createLabel({
	color:'black',
	text: 'Search History:',
	textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	top: "15",
	left: "60",
	width: 230, height: 30,
	font: { fontSize:20 }
});
previousSearchLabel.add(previousSearchIcon);
previousSearchLabel.add(previousSearchLabelText);
$.index.add(previousSearchLabel);
var spacingBox = Titanium.UI.createView({
   backgroundColor:'#F3F3F3',
   top: "208",
   width:"92%",
   height:"30"
});
$.index.add(spacingBox);
var searchHistoryResults = Ti.UI.createScrollView({
	top: "220",
	backgroundColor: '#F3F3F3',
	layout: 'vertical',
	width:"92%",
	showPagingControl:true
});
$.index.add(searchHistoryResults);

// Hide all user history UI until check is made if it exists.
hideHistoryBlock(); 

/*
 * Star Widget
 */ 
$.starwidget.init();

var resultsView = Ti.UI.createScrollView({
	top:180,
	layout: 'vertical' 
}); 

$.index.add(resultsView);
resultsView.hide();

/*
 * Delay function for when user types.
 */
var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();
/*
 * Search Box Functionality.
 */
showHistoryBlock();
searchInputBox.addEventListener('change', function(e) {
	resultsView.hide();
	resultsView.removeAllChildren();

	var backspace = false;
	var searchInput = searchInputBox.value; // Get searchInput.
	counter.push(searchInput.length);

	// Get this input length and last input length to help detect if user has pressed backspace.
	var last_element = counter[counter.length - 2];
	var this_element = searchInput.length;
	if (searchInput.length == 0) {
		getPreviousHistorySearches();
		showHistoryBlock();
		defaultScreenForSearch();
		searchHistoryFlag = true;
	}

	if (searchInput.length > 1) {
		searchHistoryFlag = false;
		hideHistoryBlock(); 
		rearrangeScreenForSearch();
		
		if(searchInput.length > 2){ 
			$.activityIndicator.show();
		}
		// Delay function will prevent bombardment of requests to the server.
		delay(function(){
			//// Ti.API.log("Time elapsed!");
	
			// Check user has entered a character, if so, respond with results or no results.
			if (searchInput.length > 2) {
				resultsView.show();
				var url="";
				var checkStringNumber = IsNumeric(searchInput); // Check if only numbers, if so, assume it is a telephone number, else assume user is searching company name.
				if (checkStringNumber == true) {
					// Adjust positions for number display.
					resultsView.setTop(230);
					yesResults.setTop(60);
					//// Ti.API.log("You have entered a number.");
					//// Ti.API.log("it's a premium number.");
					type = "search_by_number";
					url = rootURL + "/json/numbers?title=" + searchInput;
					getUrlContents(url, type);
				}
				else {
					//// Ti.API.log("You have entered a name.");
					// Adjust positions for company display.
					resultsView.setTop(100);
					yesResults.setTop(70);
					// Adjust URL to match name search.
					var url = rootURL + "/json/company-variations?company_name=" + searchInput;
					// Define type of search
					type = "search_by_name";
					//// Ti.API.log("URL", url);
					getUrlContents(url, type);
				}
			}
			else {
				// Nothing entered, delete everything!
				//// Ti.API.log("Nothing has been entered, remove everything!");
				// Check history if set to 0.
				//checkIfPreviousHistory();
				
			}
		}, 800 ); // This number is the delay for when the user types.
	}
	else {
		resultsView.hide();
		noResults.hide();
		yesResults.hide();
		resultsView.data = [];
		$.activityIndicator.hide();
	}


	// Check if backspace is pressed.
	if (this_element < last_element) {
		// Reset displays.
		//resultsView.hide();
	}
});

/*
 * Call now button.
 */
function numberDetails(id, call_button_number) {
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	
	var numberWindow = Ti.UI.createWindow({
    	fullscreen: false,
    	backgroundColor: "#fff"
	});
	
	// Title object.
	var numberTitle = Ti.UI.createLabel({
		color:'black',
		text: "Number: " + number,
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "0",
		width: "100%", height: 30,
		font: { fontSize:23 }
	});
	
	// Call button objects.
	var callButton = Titanium.UI.createView({
	   backgroundColor:'#4993DF',
	   top: "70",
	   width:"92%",
	   height:"60",
	   id: currentID
	});
	var callLabel = Ti.UI.createLabel({
		color:'#fff',
		text: "Call This Number",
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "0",
		width: "100%", height: 30,
		font: { fontSize:23 }
	});
	callButton.addEventListener('click', callNumber);
	callButton.add(callLabel);
	
	// Get price objects.
	var getPrice = Titanium.UI.createView({
	   backgroundColor:'#4993DF',
	   top: "150",
	   width:"92%",
	   height:"60",
	   id: currentID
	});
	var getPriceLabel = Ti.UI.createLabel({
		color:'#fff',
		text: "Pricing Information",
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "0",
		width: "100%", height: 30,
		font: { fontSize:23 }
	});
	getPrice.add(getPriceLabel);
	
	// Add to contacts objects.
	var contactsAdd = Titanium.UI.createView({
	   backgroundColor:'#4993DF',
	   top: "230",
	   width:"92%",
	   height:"60",
	   id: currentID
	});
	var contactsAddLabel = Ti.UI.createLabel({
		color:'#fff',
		text: "Add to Contacts.",
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "0",
		width: "100%", height: 30,
		font: { fontSize:23 }
	});
	contactsAdd.add(contactsAddLabel);
	contactsAdd.addEventListener('click', saveAsContact);
	
	// Rating objects.
	var leaveRating = Titanium.UI.createView({
	   backgroundColor:'#A7A5A4',
	   top: "310",
	   width:"92%",
	   height:"60",
	   id: currentID
	});
	var ratingLabel = Ti.UI.createLabel({
		color:'#fff',
		text: "Leave a rating",
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "0",
		width: "100%", height: 30,
		font: { fontSize:23 }
	});
	// Connect to SQL, check if the number has been previous called to enable rating button.
	try {
		callHistoryDB = Ti.Database.open('userSearches');
		var callResults = callHistoryDB.execute('SELECT phone_number FROM call_entries'); 
		while (callResults.isValidRow()) {
			var callResult = callResults.fieldByName('phone_number');
		  	Ti.API.info("111111 UerCalls" +  callResult + number);
		  	if (callResult == number) {
		  		Ti.API.info("There is a match!!!");
		  		leaveRating.setBackgroundColor("#3096E0");
		  		//leaveRating.addEventListener(numberFeedback);
		  		leaveRating.addEventListener('click', function(e){
					numberFeedback(idSplitted);
				});
		  	}
		  	else {
		  		Ti.API.info("No match...");
		  	}
		  Ti.API.info("CHECK CALL HISTORY"); 
		  callResults.next(); 
		}
		callHistoryDB.close();
	}
	catch(err) { 
	   Titanium.API.log("111111 USerCalls." , err); 
	   callHistoryDB.close();  
	}
	//leaveRating.addEventListener('click', callNumber);
	leaveRating.add(ratingLabel);
	
	// Add declared objects to Window.
	numberWindow.add(numberTitle);
	numberWindow.add(callButton);
	numberWindow.add(getPrice);
	numberWindow.add(contactsAdd);
	numberWindow.add(leaveRating);
	
	// Open Window with animation effect.
	numberWindow.open({
	    activityEnterAnimation: Ti.Android.R.anim.fade_in,
	    activityExitAnimation: Ti.Android.R.anim.fade_out
	});
	
}
function callNumber() { 
	Ti.API.info('Call function id: ' + this.id);
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var call = 'tel: ' + number;
	//Ti.API.info('Call'+ call);
	var telephoneNumberValue = number;
	numberFeedback(idSplitted);
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_CALL,
		data: call
	});
	//Ti.Android.currentActivity.startActivity(intent);
	try {
		callDB = Ti.Database.open('userSearches');
		callDB.execute('BEGIN'); // begin the transaction
		//db.execute('DROP TABLE IF EXISTS search_entries'); 
		callDB.execute('CREATE TABLE IF NOT EXISTS call_entries(phone_number TEXT, UNIQUE(phone_number));'); 
		Titanium.API.log("CHECKKKKKK");   
		callDB.execute('INSERT OR IGNORE INTO call_entries (phone_number) VALUES (?)', number);
		//db.execute('INSERT OR IGNORE INTO search_entries (company_name, company_id, variation_id, search_time) VALUES (' + resultNodeCompany + ',' + Number(resultNodeCompanyID) + ',' + Number(resultNodeVariationID) +', CURRENT_TIMESTAMP);');
		callDB.execute('COMMIT'); 
		callDB.close();
		Titanium.API.log("Entered Call into DB.");   
	}
	catch(err) { 
	   Titanium.API.log("saveSearch() - Can't insert values. ");
	   callDB.close(); 
	}
}
/*
 * Save as contact.
 */
function saveAsContact(id, call_button_number) {
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var name = idSplitted[2];
	if (Titanium.Platform.name == 'android') {
        var intent = Ti.Android.createIntent
        ({
            action: 'com.android.contacts.action.SHOW_OR_CREATE_CONTACT',
            data: 'mailto:'+name
        });
            intent.putExtra('phone', number);
            intent.putExtra('name',name);

        Ti.Android.currentActivity.startActivity(intent);
     }
}

/*
 * Function to check if numeric number is in String. 
 * This checks if a user is searching by company or by a telephone number. 
 */
function IsNumeric(searchInput) {
	return (searchInput - 0) == searchInput && ('' + searchInput).trim().length > 0;
}

/*
 * Connect to server and get JSON 
 * The type variable determines the type of request. All requests in this program
 * are made from this function.
 */
function getUrlContents(url, type, companyID, companyName) {
	// Get contents from URL.
	var xhr = Ti.Network.createHTTPClient({
		ondatastream: function(e) {
			// function called as data is downloaded
		},
		// function called when the response data is available
		onload: function(e) {
			// parse the retrieved data, turning it into a JavaScript object
			var json = JSON.parse(this.responseText);
			var index;
			topprop = 0.1; // this is space between two labels one below the other
			if (type == "search_by_name") {
				resultNodes = json.companies;
				//Ti.API.log("resultNodes", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					// Ti.API.log("Results for company search: True");
					noResults.hide();
					yesResults.show();
				}
				if(resultsLength == 0) {
					// Ti.API.log("Results for company search: False");
					yesResults.hide();
					noResults.show();
				}
				var companyNames = [];
				var filtered_results = [];

				for (index = 0; index < resultsLength; ++index) {
					resultNodeCompany = resultNodes[index].company_name;
					companyNames.push(resultNodeCompany);
					resultCompanyID = resultNodes[index].company_id;
					// Check if duplicates, prevent multiple company names being written.
					if(hasDuplicates(companyNames) == false) {
						// Push company name.
						filtered_results.push({company: resultNodeCompany, company_id: resultCompanyID});
						var companyWrapper = createCompanyWrapper(resultNodeCompany, resultCompanyID);
						resultsView.add(companyWrapper);
						// Wrapper for buttons
						var variationButtonWrapper = Ti.UI.createView({
							height: Ti.UI.SIZE,
						    top: '45',
						    left: '3%',
						    textAlign: 'left',
							width: '94%'
					    });
					    companyWrapper.add(variationButtonWrapper);
					}

					resultNodeVariation = resultNodes[index].variation_name;
					resultCompanyID = resultNodes[index].company_id;
					variation_id = resultNodes[index].variation_id;
					type = "search_by_name";
					var variationButton = createVariationButton(resultCompanyID, resultNodeVariation, variation_id, index, type);
					variationButtonWrapper.add(variationButton);

				}
			}
			if (type == "search_by_number") {
				// Ti.API.log("Search by numbers initiated");
				resultNodes = json.companies;
				// Ti.API.log("JSON result", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					// Ti.API.log("Results for company search: True");
					noResults.hide();
					yesResults.show();
				}
				if(resultsLength == 0) {
					// Ti.API.log("Results for company search: False");
					yesResults.hide();
					noResults.show();
				}
				var companyNames = [];
				var filtered_results = [];
				for (index = 0; index < resultsLength; ++index) {
					resultNodeCompany = resultNodes[index].company_name;
					// Ti.API.log("resultNodeCompany", resultNodeCompany);
					companyNames.push(resultNodeCompany);
					resultCompanyID = resultNodes[index].company_id;
					// Check if duplicates, prevent multiple company names being written.
					if(hasDuplicates(companyNames) == false) {
						// Push company name.
						filtered_results.push({company: resultNodeCompany, company_id: resultCompanyID});
						// Create company wrapper.
						var companyWrapper = createCompanyWrapper(resultNodeCompany, resultCompanyID);
						resultsView.add(companyWrapper);
						// Wrapper for buttons
						var variationButtonWrapper = Ti.UI.createView({
							height: Ti.UI.SIZE,
						    top: 50,
						    left: '3%',
						    textAlign: 'left',
							width: '94%'
					    });
					    companyWrapper.add(variationButtonWrapper);
					}

					resultNodeVariation = resultNodes[index].variation_name;
					resultCompanyID = resultNodes[index].company_id;
					variation_id = resultNodes[index].variation_id;
					var variationButton = createVariationButton(resultCompanyID, resultNodeVariation, variation_id, index);
					variationButtonWrapper.add(variationButton);

				}
			}
			if (type == "companyNumbers") {

				// Get Response object telephone numbers.
				resultNodes = json.telephone_numbers;
				resultsLength = JSON.stringify(resultNodes.length);

				// Get company and variation details for wrapper title.
				resultNodeCompany = resultNodes[0].company_name;
				resultNodeCompanyID = resultNodes[0].company_id;
				resultNodeCompanyVariation = resultNodes[0].variation;
				resultNodeVariationID = resultNodes[0].variation_id;
				resultNodeCompany = resultNodeCompany + " " + resultNodeCompanyVariation;
				Ti.API.log("companyNumbers2222222222", JSON.stringify(resultNodes));
				
				Ti.API.log("****** GET URL", resultNodeCompany);
				Ti.API.log("****** SAVE SEARCH CALLED"); 
				saveSearch(resultNodeCompany, resultNodeCompanyID, resultNodeVariationID);
				
				// Create a company variation wrapper and assign numbers to it.
				CompanyVariationWrapper = createCompanyWrapper(resultNodeCompany, resultNodeCompanyID);
				resultsView.add(CompanyVariationWrapper);
				hideHistoryBlock();
				if (searchHistoryFlag == true) {
					rearrangeScreenForSearch(); 
					Ti.API.log("****** searchHistoryFlag is true"); 
					resultsView.show();
					resultsView.setTop(70);
				}
				else {
					resultsView.setTop(70);
					Ti.API.log("****** searchHistoryFlag is false"); 
				}

				resultNodeCompanyLength = resultNodeCompany.length;
				top_spacing = 40;
				if (resultNodeCompanyLength > 27){
					top_spacing = 80;
				}

				// Wrapper for call buttons
				var callButtonWrapper = Ti.UI.createView({
					height: Ti.UI.SIZE,
				    top: top_spacing,
				    left: '3%',
				    bottom: '3%',
				    textAlign: 'left',
					width: '94%'
			    });

			    CompanyVariationWrapper.add(callButtonWrapper);

				// Go through results and generate call buttons.
				for (index = 0; index < resultsLength; ++index) {
					var combinedTitle = resultNodes[index].company_name + " " +  resultNodes[index].variation;
					Ti.API.log("resultNodesCALL", JSON.stringify(combinedTitle));
					resultNodeTitle = JSON.stringify(resultNodes[index].title);
					resultNodeID = resultNodes[index].title;
					resultNodeRating = resultNodes[index].rating;
					resultNodeType = resultNodes[index].number_type;
					resultNumberID = resultNodes[index].nid;
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);

					var call_button = createNumberButton(index, resultNodeTitleNoQuotes, resultNodeID, "numbersRequest", resultNodeRating, resultNodeType, resultNumberID, combinedTitle);
					callButtonWrapper.add(call_button);
					//resultsView.show();
				}
				// createFullResultView(fullResult);
			}
			if (type == "search_by_id") {
				// Ti.API.log("search_by_id");
				fullResult = resultNodes;
				createFullResultView(fullResult);

				for (index = 0; index < resultsLength; ++index) {

					resultNodeTitle = JSON.stringify(resultNodes[index].node.title);
					resultNodeID = JSON.stringify(resultNodes[index].node.Nid);
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID);
				}
			}

	    },
	    onerror: function() {
	    	// function called when an error occurs, including a timeout
	    	// Ti.API.log("Connection Error :/");
	    	serverConnectionError();
	    },
    	timeout: 5000 // in milliseconds
	});
	// Open URL.
	xhr.open("GET", url);
	xhr.send();

	// Set activity indicator to hide when results are retrived.
	$.activityIndicator.hide();
} 
/*
 * Results Interface.
 * These functions generate the UI for telephone number results.  
 */
function createCompanyWrapper(resultNodeCompany, resultCompanyID){
	// Ti.API.log("createCompanyWrapper", resultNodeCompany);
	topprop = 0.1; // this is space between two wrappers one below the other.
	var wrapperBox = Ti.UI.createView({
		id: resultCompanyID,
		height: Ti.UI.SIZE,
	    backgroundColor:'#eeeeee',
	    height: Ti.UI.SIZE,
	    left: '3%',
	    textAlign: 'left',
		width: '94%',
		top: '0'
   });
    var company_label = Ti.UI.createLabel({
	    color: '#000',
	    height: Ti.UI.SIZE,
	    text: resultNodeCompany,
	    top: '3%',
	    bottom: '9%',
	    left: '3%',
	    font: { fontSize:24 }
	});
	wrapperBox.add(company_label);
	return wrapperBox;
}
function createVariationButton(resultCompanyID, resultNodeVariation, variation_id, index, type){
	if (type =="search_by_name") {
		top_spacing = index*70;
	}
	else {
		top_spacing = index*0.01;
	}
	// Ti.API.log("createVariationButton:", resultNodeVariation, variation_id, top_spacing);
	var variationButton = Ti.UI.createView({
		top: top_spacing,
		id: resultCompanyID + "," + variation_id,
		height: Ti.UI.SIZE,
	    left: 0,
	    bottom: 10,
	    backgroundColor:'#FAB350',
	    textAlign: 'left',
		width: '100%'
    });
    var variation_label = Ti.UI.createLabel({
	    color: '#fff',
	    text: resultNodeVariation,
	    top: 12,
	    bottom: 12,
	    left: 10,
	    font: { fontSize:24 }
	});
	variationButton.add(variation_label);
	variationButton.addEventListener('click', retriveNumbers);
	return variationButton;
}
function createNumberButton(index, resultNodeTitleNoQuotes, resultNodeID, typeOfAction, ratings, numberType, resultNumberID, combinedTitle) {
	// Check number type and assign background.
	background = "";
	var companyVariation = combinedTitle; 
	Ti.API.log("resultNodeTitleNoQuotes", combinedTitle);
	if (numberType == "Free Phone") {
		background = "#388e3c";
	}
	if (numberType == "Standard Rate") {
		background = "#ffb300";
	}
	if (numberType == "Premium") {
		background = "#e65100";
	}
	// Add spacing and create rows for entries.
	top_spacing = index*70;
	var row = Ti.UI.createView({
	    height: 60,
	    top: top_spacing,
	    left: 0
   }); 

    var call_buttons = Titanium.UI.createView({
		color: "#000",
	  	id: resultNodeID+"|"+resultNumberID+"|"+companyVariation,
	    textAlign: "left",
	    top: 1,
		width: '98%',
		height: '96%',
		backgroundColor:background
 	});
 	var call_image = Ti.UI.createImageView({
	  image:'/call_icon.png',
	  left: "25%",
	  width: "30",
	  height: "30"
	});
	call_buttons.add(call_image);
	if (ratings == "0/5") {
		ratings = "NA";

	}
	else {
		// Adjust start position if rating is a decimal.
		ratings = ratings.slice(0, -2) + "   ";
		// Ti.API.log("Company rating",ratings);
		starImageLeftMargin = "9%";
		if (ratings % 1 != 0) {
			// Ti.API.log("Decimal detected!");
			starImageLeftMargin = "16%";
		}
		var star_image = Ti.UI.createImageView({
		  image:'/star.png',
		  left: starImageLeftMargin
		});

		var star_label = Ti.UI.createLabel({
		    color: '#fff',
		    font: { fontSize:30 },
		    text: ratings,
		    textAlign: 'left',
		    width: "20%",
		    left: "3%"
		});
		call_buttons.add(star_label);
		call_buttons.add(star_image);
	}


 	var number_label = Ti.UI.createLabel({
	    color: '#fff',
	    font: { fontSize:30 },
	    text: resultNodeTitleNoQuotes,
	    textAlign: 'left',
	    width: "65%",
	    left: "40%"
	});

	call_buttons.add(number_label);


    // Add event listener if iteration request is for company lookups.
	if(typeOfAction == "companyRequest") {
		// Ti.API.log("Company Requested");
		call_buttons.addEventListener('click', retriveVariations);
	}
	// Add event listener if iteration request is for company variations.
	if(typeOfAction == "variationNumbersRequest") {
		// Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', retriveNumbers);
	}
	// Add event listener if iteration request is for telephone numbers.
	if(typeOfAction == "numbersRequest") {
		// Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', numberDetails);
		call_buttons.addEventListener('longpress', saveAsContact);
	}
	row.add(call_buttons);
	return row;
}

function retriveNumbers() {
	resultsView.removeAllChildren();
	yesResults.hide();
	var node_id = this.id;
	var idSplitted = node_id.split(',');
	var companyIDLocal = idSplitted[0];
	var variationIDLocal = idSplitted[1]; 
	Ti.API.log("JKHJHBJHBJH");
	// Ti.API.log("variation_id", variationIDLocal);
	var url = rootURL+"/json/views/numbers/" + companyIDLocal + "/" + variationIDLocal;
	type = "companyNumbers";
	companyID = "1";
	companyName = "test";
	getUrlContents(url, type);
} 
/*
 * Error Messages.
 * Generates a message if the application fails to connect to the server.  
 */
function serverConnectionError(){
	var serverConnectionError = Ti.UI.createAlertDialog({
	    cancel: 1,
	    message: 'The application is having some problems connecting to the server.' +
	    ' Could be the server but make sure your device has access to the internet.',
	    title: 'Server Connection Error'
	  });
	  serverConnectionError.addEventListener('click', function(e){
	    if (e.index === e.source.cancel){
	      //Ti.API.info('The cancel button was clicked');
	    }
	    // Ti.API.info('e.cancel: ' + e.cancel);
	    // Ti.API.info('e.source.cancel: ' + e.source.cancel);
	    // Ti.API.info('e.index: ' + e.index);
	  });
	  serverConnectionError.show();
}
/*
 * Rating functionality.
 * These functions show, get and post information about user ratings to the server.  
 */
// Generates the feedback box after user dials a number.
function numberFeedback(idSplitted){
	delay(function(){

		// Set rating to unset to prevent incorrect ratings for multiple calls.
		$.starwidget.setRating(0);

		var telePhoneNumber = idSplitted[0];
		var nodeID = idSplitted[1];

		// Set message for feedback dialog popup. Include number to tell user what number they are rating.
		numberFeedbackDialog.setMessage("Thanks for using this service, please rate " + telePhoneNumber + " to help other users.");

		// Show feedback from XML after phone call.
		numberFeedbackDialog.show();

		// Add event listener for when submit button is clicked.
		numberFeedbackDialog.addEventListener('click', function(e){
			postRatingToServer(e, nodeID);
	 	});

	}, 800 ); // This number is the delay so popup box appears after call.
}
function postRatingToServer(e, nodeID){
	//Ti.API.info('e.postRatingToServer: ' + e.index);
	// Set post URL.
	var url = rootURL+"/rest/vote/set_votes";

	// Get current rating from dialog box stars.
	var currentNumberRating = $.starwidget.getRating();

	// Check if rating is set, if so post to server.
	if (currentNumberRating > 0) {
		// Convert Rating to percentage
		var percentRating = currentNumberRating*20;

		// Create array structure in prep for sending to server.
		var voteEntry = {
		    "votes": [{
			    "entity_id": String(nodeID),
			    "value": String(percentRating)
		  	}]
		};

		var client = Ti.Network.createHTTPClient();
		client.open('POST',url);
		client.setRequestHeader('Content-Type','application/json');
		client.send(JSON.stringify(voteEntry));
	}

	//Ti.API.info('postRatingToServer Current Rating: ' + currentNumberRating);
}
/*
 * User Search Save Functionality.
 * These functions save previous searchs as well as displaying them to the user.  
 */
// These functions show/hide history block
function hideHistoryBlock() {
	previousSearchLabel.hide();
	previousSearchIcon.hide();
	previousSearchLabelText.hide();
	spacingBox.hide();
	searchHistoryResults.hide();
}
function showHistoryBlock() {
	previousSearchLabel.show();
	previousSearchIcon.show();
	previousSearchLabelText.show();
	spacingBox.show();
	searchHistoryResults.show(); 
}
function rearrangeScreenForSearch() {
	logo.hide();
	instructions.hide();
	searchInputBox.setTop(8);
	previousSearchLabel.setTop(60); 
	spacingBox.setTop(120);
	searchHistoryResults.setTop(130);
}
function defaultScreenForSearch() {
	logo.show();
	instructions.show();
	searchInputBox.setTop(100);
	previousSearchLabel.setTop(150); 
	spacingBox.setTop(210);
	searchHistoryResults.setTop(220);
}
function saveSearch(resultNodeCompany, resultNodeCompanyID, resultNodeVariationID) {
	// Send SELECT request to server
	// check length of result
	// if length == 0, add result
	// else don't add
	//var currentTimeStamp = new Date();;
	Titanium.API.log("saveSearch() - insert values",resultNodeCompany, resultNodeCompanyID, resultNodeVariationID);
	// etc.
	try {
		db = Ti.Database.open('userSearches');
		db.execute('BEGIN'); // begin the transaction
		//db.execute('DROP TABLE IF EXISTS search_entries'); 
		db.execute('CREATE TABLE IF NOT EXISTS search_entries(company_name TEXT, company_id INTEGER, variation_id INTEGER, search_time DATETIME, UNIQUE(company_id, variation_id));'); 
		Titanium.API.log("CHECKKKKKK");   
		db.execute('INSERT OR IGNORE INTO search_entries (company_name,company_id,variation_id,search_time) VALUES (?,?,?, CURRENT_TIMESTAMP)', resultNodeCompany, resultNodeCompanyID, resultNodeVariationID);
		//db.execute('INSERT OR IGNORE INTO search_entries (company_name, company_id, variation_id, search_time) VALUES (' + resultNodeCompany + ',' + Number(resultNodeCompanyID) + ',' + Number(resultNodeVariationID) +', CURRENT_TIMESTAMP);');
		db.execute('COMMIT'); 
		db.close();   
	}
	catch(err) { 
	   Titanium.API.log("saveSearch() - Can't insert values. ");
	   db.close(); 
	}
	getPreviousHistorySearches();
}
 // Create a previous search results view and get entries. . 
function getPreviousHistorySearches() { 
	searchHistoryResults.removeAllChildren();
	Titanium.API.log("888888888888getPreviousHistorySearches");   
	try {
		db = Ti.Database.open('userSearches');
		var searchResults = db.execute('SELECT company_name,company_id,variation_id,search_time FROM search_entries ORDER BY search_time DESC'); 
		while (searchResults.isValidRow()) {
		  Ti.API.info("888888888888DB SELECT" +  searchResults.fieldByName('company_name') + ',' + searchResults.fieldByName('company_id') + ',' + searchResults.fieldByName('variation_id') 
		  	+ ',' + searchResults.fieldByName('search_time')
		  );
		  Ti.API.info("888888888888TEST"); 
		  createSearchHistoryViewEntry(searchResults.fieldByName('company_name'), searchResults.fieldByName('company_id'), searchResults.fieldByName('variation_id'));
		  searchResults.next(); 
		}
		db.close();
	}
	catch(err) { 
	   Titanium.API.log("888888888888getPreviousHistorySearches." , err); 
	   db.close(); 
	}
	showHistoryBlock(); 
	 
}
getPreviousHistorySearches();
 // Create an entry if search entries exist.
function createSearchHistoryViewEntry(company_name, company_id, variation_id) {
	Ti.API.log("****createViewEntry:", company_name, company_id, variation_id);
	if(company_name !== undefined) {
		var searchButton = Ti.UI.createView({
			id: company_id + "," + variation_id,
			height: Ti.UI.SIZE,
			width: "94%",
		    left: "3%", 
		    bottom: "3%",
		    backgroundColor:'#5A595B',
		    textAlign: 'left',
	    });
	    var searchLabel = Ti.UI.createLabel({
		    color: '#fff',
		    text: company_name,
		    top: 12,
		    bottom: 12,
		    left: 10,
		    font: { fontSize:24 }
		});
		searchButton.add(searchLabel); 
		searchButton.addEventListener('click', retriveNumbers);  
		searchHistoryResults.add(searchButton); 
	}
}

/* 
 * Helper functions
 * These functions are used continuously through the old. 
 */
// This function checks if an array contains duplicates, if so, it returns true. 
function hasDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
}
// This function trims a string so it can fit into the user interface. 
function truncate(string){
   if (string.length > 25)
      return string.substring(0,25)+'...';
   else
      return string;
};
// Back button handler.
$.index.addEventListener('androidback' , function(e){
    searchInputBox.value = "";
});

/*
 * Page open
 * 
 */
$.index.add(searchInputBox);
$.index.open();
