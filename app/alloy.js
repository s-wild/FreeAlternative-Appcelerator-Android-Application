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


//Alloy.Globals.someGlobalFunction = function(){};

/*
 * Global Variables
 */
// Root url to connect to server.
var rootURL = "http://up637415.co.uk/";
// Search details
searchHistoryFlag = false;


// Trim string if too long for display. Used for company/variation.
Alloy.Globals.truncateString = function(string){
  if (string.length > 25) {
    return string.substring(0,25)+'...';
  }
  else {
    return string;
  }
};
// This function checks if an array contains duplicates, if so, it returns true.
Alloy.Globals.checkArrayForDuplicates = function(array) {
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
      var value = array[i];
      if (value in valuesSoFar) {
          return true;
      }
      valuesSoFar[value] = true;
  }
  return false;
};
// Check if numeric number is in String.
Alloy.Globals.checkNumeric = function(searchInput) {
	return (searchInput - 0) == searchInput && ('' + searchInput).trim().length > 0;
};
// Database functions.
Alloy.Globals.sqlLite = function(searchInput) {
	return (searchInput - 0) == searchInput && ('' + searchInput).trim().length > 0;
};
/*
 * SQL Lite Functions.
 */
Alloy.Globals.sqlLite = {
  /**
  * Create a point.
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
