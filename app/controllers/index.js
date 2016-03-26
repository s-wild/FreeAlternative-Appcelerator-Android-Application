// Perform tasks on page load.
(function () {

  // Hide elements on page until user searches.
  $.resultsTitle.hide();
  $.searchResultsContainer.hide();

  // Activate cursor in search box on page load for index.
  $.index.addEventListener("focus",function(e){
  	$.searchInputBox.focus();
  });

  // Initialize Star Widget for rating a phone call.
  $.starwidget.init();

})();


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
$.searchInputBox.addEventListener('change', function(e) {

	$.searchResultsContainer.hide();
	$.searchResultsContainer.removeAllChildren();
  $.resultsTitle.show();
  $.resultsTitle.setText("");

	var searchInput = $.searchInputBox.value; // Get searchInput value.
  if(searchInput.length >= 2){
    searchHistoryFlag = false;
		$.previousSearchBox.hide();;
		rearrangeScreenForSearch();
    $.activityIndicator.show();
    // Delay function will prevent bombardment of requests to the server.
    delay(function(){
      $.searchResultsContainer.show();
      // Check if only numbers, if so, assume it is a telephone number, else assume user is searching company name.
      var checkStringNumber = Alloy.Globals.checkNumeric(searchInput);
      if (checkStringNumber == true) {
        type = "search_by_number";
        url = rootURL + "/json/numbers?title=" + searchInput;
        getUrlContents(url, type);
      }
      else {
        // Adjust URL to match name search.
        var url = rootURL + "/json/company-variations?company_name=" + searchInput;
        // Define type of search
        type = "search_by_name";
        getUrlContents(url, type);
      }
    }, 800 ); // This number is the delay for when the user types.
  }
  else {
    sqlLite.getPreviousSearches();
		defaultScreenForSearch();
		searchHistoryFlag = true;
    $.searchResultsContainer.hide();
		$.searchResultsContainer.data = [];
		$.activityIndicator.hide();
  }
});

/*
 * Call now button.
 */
function numberDetails(id, call_button_number) {
  numberOptions = Alloy.createController('numberOptions').getView();
  Ti.App.Properties.setString('id', id);
  numberOptions.open();
}
function getNumberPrice(){
	// Create Price Window.
	priceWindow = Ti.UI.createWindow({
    	fullscreen: false,
    	backgroundColor: "#fff"
	});

	// Back button handler for price page.
	priceWindow.addEventListener('androidback' , function(e){
		// When user goes back, empty window contents.
		priceWindow.removeAllChildren();
		priceWindow.close();
	});

	// Open Price Window.
	priceWindow.open({
	    activityEnterAnimation: Ti.Android.R.anim.fade_in,
	    activityExitAnimation: Ti.Android.R.anim.fade_out
	});

	//
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var numberType = getNumberType(number);
	var numberPrice = getPrice(numberType);

	// Add title to top of page showing number.
	var priceLabel = Ti.UI.createLabel({
		color:'#000',
		text: "Pricing Information for " + number,
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: "15",
		left: "3%",
		width: "94%",
		font: { fontSize:23 }
	});
	priceWindow.add(priceLabel);

}
function callNumber() {
	// Close modal box after button is pressed.
	modalBox.close();
	Ti.API.info('Call function id: ' + this.id);
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var currentTelephoneNumber = 'tel: ' + number;
  Ti.App.Properties.setString('currentTelephoneNumber', currentTelephoneNumber);
	numberFeedback(idSplitted);


  // Save call in history log.
  Alloy.Globals.sqlLite.saveCallInHistory(number);
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
      companyNames = [];
      filtered_results = [];
			topprop = 0.1; // this is space between two labels one below the other
			if (type == "search_by_name") {
				var resultNodes = json.companies;
				//Ti.API.log("resultNodes", JSON.stringify(resultNodes));
				var resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					// Ti.API.log("Results for company search: True");
					$.resultsTitle.setText("Results");
				}
				if(resultsLength == 0) {
          $.resultsTitle.setText("No Results Found");
				}

				for (index = 0; index < resultsLength; ++index) {

					resultNodeCompany = resultNodes[index].company_name;
          Ti.API.log("resultNodeCompany", resultNodeCompany);
					companyNames.push(resultNodeCompany);
					resultCompanyID = resultNodes[index].company_id;
					// Check if duplicates, prevent multiple company names being written.
					if(Alloy.Globals.checkArrayForDuplicates(companyNames) == false) {
						// Push company name.
						filtered_results.push({company: resultNodeCompany, company_id: resultCompanyID});
						var companyWrapper = createCompanyWrapper(resultNodeCompany, resultCompanyID);
						$.searchResultsContainer.add(companyWrapper);
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
				// Ti.API.log("JSON result", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					// Ti.API.log("Results for company search: True");
					$.resultsTitle.setText("Results");
				}
				if(resultsLength == 0) {
					// Ti.API.log("Results for company search: False");
					$.resultsTitle.setText("No Results Found");
				}
				var companyNames = [];
				var filtered_results = [];
				for (index = 0; index < resultsLength; ++index) {
					resultNodeCompany = resultNodes[index].company_name;
					// Ti.API.log("resultNodeCompany", resultNodeCompany);
					companyNames.push(resultNodeCompany);
					resultCompanyID = resultNodes[index].company_id;
					// Check if duplicates, prevent multiple company names being written.
					if(Alloy.Globals.checkArrayForDuplicates(companyNames) == false) {
						// Push company name.
						filtered_results.push({company: resultNodeCompany, company_id: resultCompanyID});
						// Create company wrapper.
						var companyWrapper = createCompanyWrapper(resultNodeCompany, resultCompanyID);
						$.searchResultsContainer.add(companyWrapper);
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
				Alloy.Globals.sqlLite.saveSearch(resultNodeCompany, resultNodeCompanyID, resultNodeVariationID);
        // On Save, update view for previous histories.
      	sqlLite.getPreviousSearches();
				// Create a company variation wrapper and assign numbers to it.
				CompanyVariationWrapper = createCompanyWrapper(resultNodeCompany, resultNodeCompanyID);
				$.searchResultsContainer.add(CompanyVariationWrapper);
				$.previousSearchBox.hide();;
				if (searchHistoryFlag == true) {
					rearrangeScreenForSearch();
					Ti.API.log("****** searchHistoryFlag is true");
					$.searchResultsContainer.show();
					$.searchResultsContainer.setTop(70);
				}
				else {
					$.searchResultsContainer.setTop(70);
					Ti.API.log("****** searchHistoryFlag is false");
				}

				resultNodeCompanyLength = resultNodeCompany.length;
				top_spacing = 50;
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
					//$.searchResultsContainer.show();
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
	    	Alloy.Globals.errorMessages.serverConnection();
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
	    backgroundColor:'#eee',
	    left: '3%',
	    textAlign: 'left',
		width: '94%',
		top: 0
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
	$.searchResultsContainer.removeAllChildren();
  $.resultsTitle.setText("Results");
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
 * Rating functionality.
 * These functions show, get and post information about user ratings to the server.
 */
// Generates the feedback box after user dials a number.
function numberFeedback(idSplitted){
	// Close modal box after clicking feedback button. This prevents
	modalBox.close();
	delay(function(){

		// Set rating to unset to prevent incorrect ratings for multiple calls.
		$.starwidget.setRating(0);

		var telePhoneNumber = idSplitted[0];
		var nodeID = idSplitted[1];

		// Set message for feedback dialog popup. Include number to tell user what number they are rating.
		$.rateNumber.setMessage("Thanks for using this service, please rate " + telePhoneNumber + " to help other users.");

		// Show feedback from XML after phone call.
		$.rateNumber.show();

		// Add event listener for when submit button is clicked.
		$.rateNumber.addEventListener('click', function(e){
			postRatingToServer(e, nodeID);
	 	});

	}, 800 ); // This number is the delay so popup box appears after call.
}
function postRatingToServer(e, nodeID){
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
}
/*
 * User Search Save Functionality.
 * These functions save previous searchs as well as displaying them to the user.
 */
function rearrangeScreenForSearch() {
	$.imageLogo.hide();
	$.searchTitle.hide();
  $.previousSearchBox.hide();
  $.addClass($.searchInputBox, 'afterSearch');
  $.removeClass($.searchInputBox, 'beforeSearch');
}
function defaultScreenForSearch() {
	$.imageLogo.show();
	$.searchTitle.show();
  $.addClass($.searchInputBox, 'beforeSearch');
  $.removeClass($.searchInputBox, 'afterSearch');
}
/*
* SQL Lite Functions relating to index page.
*/
sqlLite = {
    getPreviousSearches: function() {
      // Remove all previous entries in case new entries have occured.
      $.searchHistoryResults.removeAllChildren();

      // Try to see if any entries exist in database.
      try {
        db = Ti.Database.open('userSearches');
        var searchResults = db.execute('SELECT company_name,company_id,variation_id,search_time FROM search_entries ORDER BY search_time DESC');
        while (searchResults.isValidRow()) {
          createSearchHistoryViewEntry(searchResults.fieldByName('company_name'), searchResults.fieldByName('company_id'), searchResults.fieldByName('variation_id'));
          searchResults.next();
        }
        db.close();
      }
      catch(err) {
         Titanium.API.log("sqlLite.getPreviousSearches." , err);
         db.close();
      }

      // Show history block after creating new entries.
      $.previousSearchBox.show();;
    },
    /**
     * Get Call History, enable feedback button if exists..
     * @param {string} number - The telephone number.
     * @param {string} idSplitted - Contains ID and phone number passed from button.
     * @param {object} leaveRatingButton - Button View.
     */
    getCallHistory: function(number, idSplitted, leaveRatingButton) {
      // Connect to SQL, check if the number has been previous called to enable rating button.
    	try {
        Titanium.API.log("getCallHistory @param:" , number + " " + idSplitted);
    		callHistoryDB = Ti.Database.open('userSearches');
    		var callResults = callHistoryDB.execute('SELECT phone_number FROM call_entries');
    		while (callResults.isValidRow()) {
    			var callResult = callResults.fieldByName('phone_number');
    		  	if (callResult == number) {
    		  		Ti.API.info("getCallHistory: Matched.");
    		  		leaveRatingButton.setBackgroundColor("#3096E0");
    		  		leaveRatingButton.addEventListener('click', function(e){
    					numberFeedback(idSplitted);
    				});
    		  	}
    		  	else {
    		  		Ti.API.info("getCallHistory: No match.");
    		  	}
    		  callResults.next();
    		}
    		callHistoryDB.close();
    	}
    	catch(err) {
    	   Titanium.API.log("getCallHistory error:" , err);
    	   callHistoryDB.close();
    	}
    }
}
sqlLite.getPreviousSearches();
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
		$.searchHistoryResults.add(searchButton);
	}
}
// Back button handler for Index.
$.index.addEventListener('androidback' , function(e){
    $.searchInputBox.value = "";
});

/*
 * Page open
 *
 */
$.index.open();
