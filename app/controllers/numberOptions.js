// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args;
var currentID = this.id;
Titanium.API.log("currentID**********:" , currentID);

idSplitted = currentID.split('|');
var number = idSplitted[0];
var nid = idSplitted[1];


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
sqlLite.getCallHistory(number, idSplitted, leaveRatingButton);
//leaveRating.addEventListener('click', callNumber);
leaveRatingButton.add(ratingImage);
leaveRatingButton.add(ratingLabel);


// Add event listeners to buttons.
callButton.addEventListener('click', Alloy.Globals.numberOptions.call);
// getPriceButton.addEventListener('click', getNumberPrice);
// contactsAddButton.addEventListener('click', saveAsContact);

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
