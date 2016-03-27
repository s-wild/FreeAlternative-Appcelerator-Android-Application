// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

/*
 * Global Variables
 */
// Root url to connect to server.
Alloy.Globals.rootURL = "http://up637415.co.uk/";
// Search details
Alloy.Globals.searchHistoryFlag = false;
Alloy.Globals.searchType = "na";
Alloy.Globals.minLengthBeforeSearch = 2;

/*
 * Delay function for when user types.
 */
Alloy.Globals.delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

/*
 * Global helper functions.
 */
Alloy.Globals.helpers = {
    /**
    * Returns a trimmed a string to prevent layout issues.
    * from http://stackoverflow.com/questions/4700226/i-want-to-truncate-a-text-or-line-with-ellipsis-using-javascript
    * @param {string} string - The full length of a string.
    */
    truncateString: function(string) {
      if (string.length > 25) {
        return string.substring(0,25)+'...';
      }
      else {
        return string;
      }
    },
    /**
    * Filters companies for display.
    * from http://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values
    * @param {array} Array - Array of companies.
    */
    checkArrayForDuplicates: function(array) {
      var valuesSoFar = Object.create(null);
      for (var i = 0; i < array.length; ++i) {
          var value = array[i];
          if (value in valuesSoFar) {
              return true;
          }
          valuesSoFar[value] = true;
      }
      return false;
    },
    /**
    * Numeric check, the returned value is used to set the URL for HTTP request.
    * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
    * @param {searchInput} string - Value from search box on startup screen.
    */
    checkNumeric: function(searchInput) {
      return !isNaN(parseFloat(searchInput)) && isFinite(searchInput);
    },
    /**
    * Checks the telephone number type, this is passed to the server.
    * The return value is passed to the server which sets the pricing.
    * @param {number} string - Telephone number value.
    */
    getNumberType: function(number) {
        number_type = "na";
        switch (true) {
    		case number.substring(0, 4) == "0870":
    			number_type = "0870";
    		  break;
    		case number.substring(0, 4) == "0800":
    		    number_type = "0800";
    		  break;
    		case number.substring(0, 4) == "0845":
    		    number_type = "0845";
    		  break;
    	}
    	return number_type;
    }
};
/*
 * SQL Lite Functions.
 */
Alloy.Globals.sqlLite = {
  /**
  * Create a user search entry.
  * @param {string} resultNodeCompany - The company name.
  * @param {string} resultNodeCompanyID - The company ID from database.
  * @param {string} resultNodeVariationID - The company variation ID from database.
  */
  saveSearch: function(resultNodeCompany, resultNodeCompanyID, resultNodeVariationID) {
    // Save search to SQL Lite Database.
    try {
      db = Ti.Database.open('userSearches');
      db.execute('BEGIN'); // begin the transaction
      db.execute('CREATE TABLE IF NOT EXISTS search_entries(company_name TEXT, company_id INTEGER, variation_id INTEGER, search_time DATETIME, UNIQUE(company_id, variation_id));');
      Titanium.API.log("CHECKKKKKK");
      db.execute('INSERT OR REPLACE INTO search_entries (company_name,company_id,variation_id,search_time) VALUES (?,?,?, CURRENT_TIMESTAMP)', resultNodeCompany, resultNodeCompanyID, resultNodeVariationID);
      db.execute('COMMIT');
      db.close();
    }
    catch(err) {
       Titanium.API.log("saveSearch() - Can't insert values. ");
       db.close();
    }
  },
  /**
   * Create call entry in SQL Lite.
   * @param {number} number - The telephone number value.
   */
  saveCallInHistory: function(number) {
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
};
/*
 * Error Messages.
 */
Alloy.Globals.errorMessages = {
    serverConnection: function() {
      var serverConnectionError = Ti.UI.createAlertDialog({
        cancel: 1,
        message: 'The application is having some problems connecting to the server.' +
        ' Could be the server but make sure your device has access to the internet.',
        title: 'Server Connection Error'
      });
      serverConnectionError.addEventListener('click', function(e){
        if (e.index === e.source.cancel){
        }
      });
      serverConnectionError.show();
    }
};
/**
 * Post's the users rating to server. .
 * @param {nodeID} string - Drupal API needs node id to leave a rating.
 */
Alloy.Globals.postRatingToServer = function(nodeID){
  // Set post URL.
	var url = Alloy.Globals.rootURL+"/rest/vote/set_votes";

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
};
