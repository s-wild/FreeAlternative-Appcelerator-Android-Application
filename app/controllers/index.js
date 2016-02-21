
// Get displays on load, hide if necessary.
noResults = $.noResults;
noResults.hide();
yesResults = $.yesResults;
yesResults.hide();
searchInputBox = $.searchInputBox;
numberFeedbackDialog = $.rateNumber;

// Initialise rating widget.
$.starwidget.init();

var resultsView = Ti.UI.createScrollView({
	top:180,
	layout: 'vertical'
});

$.index.add(resultsView);

// Delay function for when user types.
var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

// Global Variables
call_buttons = [];
var first = true;
rootURL = "http://10.0.3.2/fa.dev/httpdocs";
var counter = [];

// Search results array
searchResultsArray = [];

// searchInputBox.setValue("e.g. Vodafone or 0870070191");
searchInputBox.addEventListener('change', function(e) {
	resultsView.hide();
	resultsView.removeAllChildren();

	var backspace = false;
	var searchInput = searchInputBox.value; // Get searchInput.
	counter.push(searchInput.length);

	// Get this input length and last input length to help detect if user has pressed backspace.
	var last_element = counter[counter.length - 2];
	var this_element = searchInput.length;

	if (searchInput.length > 1) {
		$.activityIndicator.show();
		// Delay function will prevent bombardment of requests to the server.
	delay(function(){
		Ti.API.log("Time elapsed!");

		// Check user has entered a character, if so, respond with results or no results.
		if (searchInput.length > 2) {
			resultsView.show();
			var url="";
			var checkStringNumber = IsNumeric(searchInput); // Check if only numbers, if so, assume it is a telephone number, else assume user is searching company name.
			if (checkStringNumber == true) {
				// Adjust positions for number display.
				resultsView.setTop(230);
				yesResults.setTop(190);
				Ti.API.log("You have entered a number.");
				Ti.API.log("it's a premium number.");
				type = "search_by_number";
				url = rootURL + "/json/numbers?title=" + searchInput;
				getUrlContents(url, type);
			}
			else {
				Ti.API.log("You have entered a name.");
				// Adjust positions for company display.
				resultsView.setTop(230);
				yesResults.setTop(190);
				// Adjust URL to match name search.
				var url = rootURL + "/json/company-variations?company_name=" + searchInput;
				// Define type of search
				type = "search_by_name";
				Ti.API.log("URL", url);
				getUrlContents(url, type);
			}
		}
		else {
			// Nothing entered, delete everything!
			Ti.API.log("Nothing has been entered, remove everything!");
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

// Call now button.
function callButton(id, call_button_number) {
	Ti.API.info('Call function id: ' + this.id);
	var currentID = this.id
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var call = 'tel: ' + number;
	Ti.API.info('Call'+ call);
	var telephoneNumberValue = number;
	numberFeedback(idSplitted);
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_CALL,
		data: call
	});
	Ti.Android.currentActivity.startActivity(intent);
}

// Function to check if numeric number is in String.
function IsNumeric(searchInput) {
	return (searchInput - 0) == searchInput && ('' + searchInput).trim().length > 0;
}
// Get JSON for name search
function getUrlContents(url, type, companyID, companyName) {
	Ti.API.info("url="+url);
	Ti.API.info("company GETURL="+companyID);
	Ti.API.info("company name GETURL="+companyName);
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
				Ti.API.log("resultNodes", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					Ti.API.log("Results for company search: True");
					noResults.hide();
					yesResults.show();
				}
				if(resultsLength == 0) {
					Ti.API.log("Results for company search: False");
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
				Ti.API.log("Search by numbers initiated");
				resultNodes = json.companies;
				Ti.API.log("JSON result", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					Ti.API.log("Results for company search: True");
					noResults.hide();
					yesResults.show();
				}
				if(resultsLength == 0) {
					Ti.API.log("Results for company search: False");
					yesResults.hide();
					noResults.show();
				}
				var companyNames = [];
				var filtered_results = [];
				for (index = 0; index < resultsLength; ++index) {
					resultNodeCompany = resultNodes[index].company_name;
					Ti.API.log("resultNodeCompany", resultNodeCompany);
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
				resultsView.removeAllChildren();

				// Get Response object telephone numbers.
				resultNodes = json.telephone_numbers;
				resultsLength = JSON.stringify(resultNodes.length);

				// Get company and variation details for wrapper title.
				var resultNodeCompany = resultNodes[0].company_name;
				var resultNodeCompanyID = resultNodes[0].company_id;
				var resultNodeCompanyVariation = resultNodes[0].variation;
				var resultNodeCompanyVariationID = resultNodes[0].variation_id;
				resultNodeCompany = resultNodeCompany + " " + resultNodeCompanyVariation;
				Ti.API.log("companyNumbers2222222222", resultNodeCompany.length);

				// Create a company variation wrapper and assign numbers to it.
				CompanyVariationWrapper = createCompanyWrapper(resultNodeCompany, resultNodeCompanyID);
				resultsView.add(CompanyVariationWrapper);
				resultsView.show();
				resultsView.setTop(190);
				
				saveSearch(resultNodeCompany, resultNodeCompanyVariation, resultNodeCompanyID, resultNodeCompanyVariationID);

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
					Ti.API.log("resultNodesCALL", JSON.stringify(resultNodes));
					resultNodeTitle = JSON.stringify(resultNodes[index].title);
					resultNodeID = resultNodes[index].title;
					resultNodeRating = resultNodes[index].rating;
					resultNodeType = resultNodes[index].number_type;
					resultNumberID = resultNodes[index].nid;
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);

					var call_button = createNumberButton(index, resultNodeTitleNoQuotes, resultNodeID, "numbersRequest", resultNodeRating, resultNodeType, resultNumberID);
					callButtonWrapper.add(call_button);
					//resultsView.show();
				}
				// createFullResultView(fullResult);
			}
			if (type == "search_by_id") {
				Ti.API.log("search_by_id");
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
	    	Ti.API.log("Connection Error :/");
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
function createCompanyWrapper(resultNodeCompany, resultCompanyID){
	Ti.API.log("createCompanyWrapper", resultNodeCompany);
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
	Ti.API.log("createVariationButton:", resultNodeVariation, variation_id, top_spacing);
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
function createNumberButton(index, resultNodeTitleNoQuotes, resultNodeID, typeOfAction, ratings, numberType, resultNumberID) {
	// Check number type and assign background.
	background = "";
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
	  	id: resultNodeID+"|"+resultNumberID,
	    textAlign: "left",
	    top: 1,
		width: '98%',
		height: '96%',
		backgroundColor:background
 	});
 	var call_image = Ti.UI.createImageView({
	  image:'call_icon.png',
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
		Ti.API.log("Company rating",ratings);
		starImageLeftMargin = "9%";
		if (ratings % 1 != 0) {
			Ti.API.log("Decimal detected!");
			starImageLeftMargin = "16%";
		}
		var star_image = Ti.UI.createImageView({
		  image:'star.png',
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
		Ti.API.log("Company Requested");
		call_buttons.addEventListener('click', retriveVariations);
	}
	// Add event listener if iteration request is for company variations.
	if(typeOfAction == "variationNumbersRequest") {
		Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', retriveNumbers);
	}
	// Add event listener if iteration request is for telephone numbers.
	if(typeOfAction == "numbersRequest") {
		Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', callButton);
	}
	row.add(call_buttons);
	return row;
}

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function retriveVariations() {
	type = "variations";
	var node_id = this.id;
	var companyID = node_id;
	Ti.API.log("retriveVariations() Node id " + node_id);
	var fullResultTitle = this.title+":";
	var companyName = this.title;
	var NodeIDNoQuotes = node_id.slice(1, -1);
	var url = rootURL+"/json/company-variations?company_name=" + companyName;
	getUrlContents(url, type, companyID, companyName);
}

function retriveNumbers() {
	yesResults.hide();
	var node_id = this.id;
	var idSplitted = node_id.split(',');
	var companyIDLocal = idSplitted[0];
	var variationIDLocal = idSplitted[1];
	Ti.API.log("company_id", companyIDLocal);
	Ti.API.log("variation_id", variationIDLocal);
	var url = rootURL+"/json/views/numbers/" + companyIDLocal + "/" + variationIDLocal;
	type = "companyNumbers";
	getUrlContents(url, type);
}

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
// Generates a message if the application fails to connect to the server.
function serverConnectionError(){
	var serverConnectionError = Ti.UI.createAlertDialog({
	    cancel: 1,
	    message: 'The application is having some problems connecting to the server.' +
	    ' Could be the server but make sure your device has access to the internet.',
	    title: 'Server Connection Error'
	  });
	  serverConnectionError.addEventListener('click', function(e){
	    if (e.index === e.source.cancel){
	      Ti.API.info('The cancel button was clicked');
	    }
	    Ti.API.info('e.cancel: ' + e.cancel);
	    Ti.API.info('e.source.cancel: ' + e.source.cancel);
	    Ti.API.info('e.index: ' + e.index);
	  });
	  serverConnectionError.show();
}
// Rating post.
function postRatingToServer(e, nodeID){
	Ti.API.info('e.postRatingToServer: ' + e.index);
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
		Ti.API.info(JSON.stringify(voteEntry));

		// Get contents from URL.
		// var xhr = Ti.Network.createHTTPClient({
			// // function called when the response data is available
			// onload: function(e) {
			// }
		// });
		// // Post URL.
		// xhr.open("POST", url);
		// xhr.send(voteEntry);

		var client = Ti.Network.createHTTPClient();
		client.open('POST',url);
		client.setRequestHeader('Content-Type','application/json');
		client.send(JSON.stringify(voteEntry));
	}

	Ti.API.info('postRatingToServer Current Rating: ' + currentNumberRating);
}
// This function saves a user search.
function saveSearch(resultNodeCompany, resultNodeCompanyVariation, resultNodeCompanyID, resultNodeCompanyVariationID) {
	// Define storage name.
	var searchStorageName = "searchHistory106";
	
	// Create search entry object.
	var localSearchObject = {
	    company_name: resultNodeCompany,
	    company_variation: resultNodeCompanyVariation,
	    company_id: resultNodeCompanyID,
	    variation_id: resultNodeCompanyVariationID
	};
	
	searchResultsArray.push(localSearchObject);

	//var currentStorage = Ti.App.Properties.getList(searchStorageName);
	Ti.App.Properties.setList(searchStorageName, searchResultsArray);
	
	Ti.API.log("storageAfterProcessing" + JSON.stringify(Ti.App.Properties.getList(searchStorageName)));
}

$.index.open();
