
// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args;

// Back button handler for price page.
$.telephonePricing.addEventListener('androidback' , function(e){
  // When user goes back, empty window contents.
  $.telephonePricing.removeAllChildren();
  $.telephonePricing.close();
});

var pricingID = Ti.App.Properties.getString('pricingID');
var idSplitted = pricingID.split('|');
var number = idSplitted[0];
var nid = idSplitted[1];
var numberType = Alloy.Globals.helpers.getNumberType(number);
var numberPrice = getPrice(numberType);
var numberFormatted = Ti.Locale.formatTelephoneNumber(number);

$.priceTitle.setText(numberFormatted + " Pricing");

// Get Number Price Functionality.
function getPrice(numberType) {
	var companyNamesPrice = [];
	var filtered_results_companies = [];

	if (numberType == "na") {
		Ti.API.log("getPrice", "Number not found.");
    var noPricing = Ti.UI.createLabel({
      color:'#000',
      font:{fontFamily:'Arial', fontSize:22, fontWeight:'normal'},
      text: "No Pricing Found.",
      top: 220,
      textAlign: "center",
      width:"100%"
    });
    $.telephonePricing.add(noPricing);
	}
	else {
		Ti.API.log("getPrice", numberType);
		var url = Alloy.Globals.rootURL + "/telephone-numbers/pricing/" + numberType;
		 var client = Ti.Network.createHTTPClient({
		     // function called when the response data is available
		     onload : function(e) {

		        Ti.API.info("Received text: " + this.responseText);

		        var json = JSON.parse(this.responseText);
		        resultNodes = json.prices;

				resultsLength = resultNodes.length;
				Ti.API.info("resultsLength ", resultsLength);
				for (index = 0; index < resultsLength; ++index) {
					var companyName = resultNodes[index].title;
					var numberType = resultNodes[index].number_type;
					var accessCharge = resultNodes[index].access_charge;
					var phonePlan = resultNodes[index].plan;
					companyNamesPrice.push({company: companyName, number_type: numberType, access_charge: accessCharge, phone_plan: phonePlan});
				}

				// Group results based on company name.
				grouped = {};

				companyNamesPrice.forEach(function (a) {
				    grouped[a.company] = grouped[a.company] || [];
				    grouped[a.company].push({ number_type: a.number_type, access_charge: a.access_charge, phone_plan: a.phone_plan });
				});

				groupedResults = JSON.stringify(grouped);
				groupedResultsLength = Object.keys(grouped).length;
				Ti.API.info("companyNamesPricegrouped ", JSON.stringify(grouped));

				var companyData = [];
				// Loop over companies in grouped results.
				for (var key in grouped) {
					var indexCompany = Object.keys(grouped).indexOf(key);
					var groupKey = grouped[key];

					Ti.API.info("getPrice() indexCompany ", key);
					Ti.API.info("getPrice() indexCompany ", JSON.stringify(indexCompany));
					Ti.API.info("getPrice() groupKey ", JSON.stringify(groupKey));

					// Create Company Table
					createCompanyTable(key, indexCompany, groupKey);
					companyData.push(row);
				}
				var createCustomView = function() {
					var view = Ti.UI.createView({
						backgroundColor: '#222',
						height: 40
					});
					var operator = Ti.UI.createLabel({
						text: "Operator Name",
						left: "10%",
						color: '#fff'
					});
					view.add(operator);
					var payg = Ti.UI.createLabel({
						text: "Contract",
						left: "50%",
						color: '#fff'
					});
					view.add(payg);
					var contract = Ti.UI.createLabel({
						text: "PAYG",
						left: "70%",
						color: '#fff'
					});
					view.add(contract);
					return view;
				};

				var tableOfCompanies = Ti.UI.createTableView({
				  backgroundColor:'white',
				  headerView: createCustomView(),
				  data: companyData,
				  top: 130
				});

				Ti.API.info("operatorNames ", JSON.stringify(filtered_results_companies));

				// Add table of companies.
				$.telephonePricing.add(tableOfCompanies);

		     },
		     // function called when an error occurs, including a timeout
         onerror: function() {
   	    	Alloy.Globals.errorMessages.serverConnection();
   	    },
		     timeout : 3000  // in milliseconds
		 });
		 // Prepare the connection.
		 client.open("GET", url);
		 // Send the request.
		 client.send();
	}

}

// Create company table for pricing.
function createCompanyTable(key, indexCompany, groupKey){
	var defaultFontSize = Ti.Platform.name === 'android' ? 16 : 14;
	
	// Get operatorName and color row to match.
	var telephonymanager = require("com.goyya.telephonymanager");
	var networkOperatorName = telephonymanager.networkOperatorName;
	Ti.API.log('networkOperatorName:   ' + telephonymanager.networkOperatorName);

	for (index = 0; index < groupKey.length; ++index){
		if(key.toLowerCase() === networkOperatorName){
			var backgroundColor = "#FBB450";
		}
		else {
			backgroundColor = "#eee";
		}
	  row = Ti.UI.createTableViewRow({
	    className:'numberPricing', // used to improve table performance
	    rowIndex:index, // custom property, useful for determining the row during events
	    height:40,
	    backgroundColor: backgroundColor
	  }); 

	  var labelCompanyName = Ti.UI.createLabel({
	    color:'#000',
	    font:{fontFamily:'Arial', fontSize:defaultFontSize+6, fontWeight:'bold'},
	    text: key,
	    left:"10%",
	    width:200, height: 30,
	    background: "#000"
	  });
	  row.add(labelCompanyName);

	  	// Loop over details for each company.
		for (index = 0; index < groupKey.length; ++index) {
			// Add Prices to table.
			Ti.API.info("groupKeyIndex", JSON.stringify(groupKey[index]));
		  //addPricesToTable();
		  var type = "NA";
		  if(groupKey[index].phone_plan == "0"){
		  	var labelDetails = Ti.UI.createLabel({
			    color:'#000',
			    font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
			    text: "£" + groupKey[index].access_charge,
			    left:"50%",
			    width:360
			  });
			  row.add(labelDetails);
		  }
		  else if (groupKey[index].phone_plan === "1") {
		  	 var labelDetails = Ti.UI.createLabel({
			    color:'#000',
			    font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
			    text: "£" + groupKey[index].access_charge,
			    left:"70%",
			    width:360
			  });
			  row.add(labelDetails);
		  }

		}
	}

	return row;
}
// Add prices table.
function addPricesToTable(){
	Ti.API.info("groupKeyIndex", JSON.stringify(groupKey[index]));
	var priceValue = groupKey[index].access_charge;
	// Check if variable is contract or pay as you go.
	Ti.API.info("companyNamesPricegrouped ", priceValue.length);
	if (priceValue !== 0) {
		if (groupKey[index].phone_plan === 0 ) {
			filtered_results_companies.push(priceValue);
		}
		else {
			filtered_results_companies.push("na");
			Ti.API.info("phone plan is contract");
		}
	}
}
function createPriceEntry(planType, priceValue){
	if (planType == "payg") {
		Ti.API.info("phone plan is PAYG");
	}
	if (planType == "contract") {
		Ti.API.info("phone plan is contract");
	}
	Ti.API.info("createPriceEntry ");
}
// Set orientation.
$.index.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]; 

// Open Price Window.
$.telephonePricing.open({
    activityEnterAnimation: Ti.Android.R.anim.fade_in,
    activityExitAnimation: Ti.Android.R.anim.fade_out
});
