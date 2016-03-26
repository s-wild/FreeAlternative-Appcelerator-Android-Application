// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args;

var currentID = Ti.App.Properties.getString('currentID');
var currentTelephoneNumber = Ti.App.Properties.getString('telephoneNumber');
var nid = Ti.App.Properties.getString('node_id');

Titanium.API.log("currentTelephoneNumber**********:" , currentTelephoneNumber);


// Create modal box to display results (global variable to close after action).
modalBox = Ti.UI.createWindow({
    backgroundColor : 'transparent',
    statusBarHidden:true,
    tabBarHidden:true,
    navBarHidden:true
});

// Create wrapper, background and container view.
var wrapperView = Ti.UI.createView(); // Full screen
var backgroundView = Ti.UI.createView({  // Also full screen
    backgroundColor : '#000',
    opacity         : 0.5
});
var containerView  = Ti.UI.createView({  // Set height appropriately
    height          : 290,
    backgroundColor : '#FFF',
    width: "90%"
});

/*
 * Add number buttons
 */
var startingTopPosition = 10;
var buttonWidth = "94%";
var buttonHeight = 60;
var iconWidth = 30;
var iconHeight = 30;
var iconLeftSpacing = "30%";

var callButton = Titanium.UI.createView({
   backgroundColor:'#4993DF',
   top: startingTopPosition,
   width: buttonWidth,
   height: buttonHeight,
   id: currentID
});
var callButtonImage = Ti.UI.createImageView({
  image:'/outgoing_call_icon.png',
  left: iconLeftSpacing,
  width: iconWidth,
  height: iconHeight
});
// Add label to call button.
callButton.add(callButtonImage);
// Call button label.
var callButtonLabel = Ti.UI.createLabel({
  color:'#fff',
  text: "Call",
  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  top: "15",
  left: "0",
  width: "100%", height: 30,
  font: { fontSize:23 }
});
// Add label to call button.
callButton.add(callButtonLabel);
// Get price objects.
var getPriceButton = Titanium.UI.createView({
   backgroundColor:'#4993DF',
   top: startingTopPosition + 70,
   width: buttonWidth,
   height: buttonHeight,
   id: currentID
});
var getPriceImage = Ti.UI.createImageView({
  image:'/call_price_icon.png',
  left: "12%",
  width: iconWidth,
  height: iconHeight
});
// Add label to call button.
getPriceButton.add(getPriceImage);
var getPriceLabel = Ti.UI.createLabel({
  color:'#fff',
  text: "Pricing Information",
  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  top: "15",
  left: "6%",
  width: "100%", height: 30,
  font: { fontSize:23 }
});
// Add label to get price button.
getPriceButton.add(getPriceLabel);
// Add to contacts button.
var contactsAddButton = Titanium.UI.createView({
   backgroundColor:'#4993DF',
   top: startingTopPosition + 140,
   width: buttonWidth,
   height: buttonHeight,
   id: currentID
});
var contactsAddImage = Ti.UI.createImageView({
  image:'/add_contact_icon.png',
  left: "16%",
  width: iconWidth,
  height: iconHeight
});
var contactsAddLabel = Ti.UI.createLabel({
  color:'#fff',
  text: "Add to Contacts.",
  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  top: "15",
  left: "6%",
  width: "100%", height: 30,
  font: { fontSize:23 }
});
contactsAddButton.add(contactsAddImage);
contactsAddButton.add(contactsAddLabel);

// Ratings Button + check to see if existing rating exists. It not, disable button.
var leaveRatingButton = Titanium.UI.createView({
  backgroundColor:'#A7A5A4',
  top: startingTopPosition + 210,
  width: buttonWidth,
  height: buttonHeight,
  id: currentID
});
var ratingImage = Ti.UI.createImageView({
  image:'/rating_icon.png',
  left: "16%",
  width: iconWidth,
  height: iconHeight
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
sqlLite.getCallHistory(currentTelephoneNumber, idSplitted, leaveRatingButton);
//leaveRating.addEventListener('click', callNumber);
leaveRatingButton.add(ratingImage);
leaveRatingButton.add(ratingLabel);


// Add event listeners to buttons.
callButton.addEventListener('click', callNumber);
getPriceButton.addEventListener('click', getNumberPrice);
contactsAddButton.addEventListener('click', saveAsContact);

// Add buttons to container view.
containerView.add(callButton);
containerView.add(getPriceButton);
containerView.add(contactsAddButton);
containerView.add(leaveRatingButton);

backgroundView.addEventListener('click', function () {
    modalBox.close();
});

wrapperView.add(backgroundView);
wrapperView.add(containerView);

modalBox.add(wrapperView);
modalBox.open({modal:true});

/*
 * Number Options.
 */
function callNumber() {
	// Close modal box after button is pressed.
	modalBox.close();
	Ti.API.info('Call function id: ' + this.id);
	var currentID = this.id;
	var idSplitted = currentID.split('|');
	var number = idSplitted[0];
	var nid = idSplitted[1];
	var call = 'tel: ' + number;
	//Ti.API.info('Call'+ call);
	var telephoneNumberValue = number;
	//numberFeedback(idSplitted);
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_CALL,
		data: call
	});
	Ti.Android.currentActivity.startActivity(intent);

  // Save call in history log.
  Alloy.Globals.sqlLite.saveCallInHistory(number);
}
/*
 * Save as contact.
 */
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
