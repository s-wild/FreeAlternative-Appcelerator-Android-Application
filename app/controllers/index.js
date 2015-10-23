// TESTING
			
var scrollView = Ti.UI.createScrollView({
    contentWidth:'auto',
    contentHeight:'auto',
    width:350,
    height:240,
    top:125,
    backgroundColor:'red'     
});
$.index.add(scrollView);

var textField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 50, left: 10,
  width: 360, height: 60,keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD,
  softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
});
$.index.add(textField);

textField.addEventListener('change', function(e){
	
    // 	Get phoneSearchValue.
	var phoneSearchValue = textField.value;
	
    // 	Check if value is a phone number. 
	if (phoneSearchValue.length == 11) {
 
		var number = phoneSearchValue;
		
		// Set JSON URL. 		
		var url = "http://up637415.co.uk/node.json?field_premium_number=" + number;
		var json;
		
        // Get contents from URL. 		
		var xhr = Ti.Network.createHTTPClient({
			onload: function() {
			Ti.API.log("JSON:::  " + this.responseText);  
			
			// parse the retrieved data, turning it into a JavaScript object
			var json = JSON.parse(this.responseText);
			var json_free_phone_numbers = json['list']['0']['field_free_phone'];  
			
			Ti.API.log("Field_FREE_PHONE:::  " + json_free_phone_numbers);  

            // Iterate over each result. Generate button to call. 			
			json_free_phone_numbers.forEach(function(entry) {
				
				// var button_spacing = toString(top_buttons_spacing+= 10);
				
			    // Ti.API.log("Top Spacing:::   " + increment);
			    var callButton = Titanium.UI.createButton({
			        top : "0",
			        width : "94%",
			        height : "60dp",
			        title : entry,
			        font: {fontSize: '30'},
			    });
			    callButton.addEventListener('click', callNowButton);
			    scrollView.add(callButton);
			});
			
			}
		});
		
        // Open URL.		
		xhr.open("GET", url); 
		xhr.send();
		
		
	
	}
        
});
 
function callNowButton(e) {
	// This function will be called by multiple handlers
	// The event object is accessible within this function
	Ti.API.info('The '+e.type+' event happened' + this.title);
	var call = 'tel: ' + this.title;
	var intent = Ti.Android.createIntent({
	        action : Ti.Android.ACTION_CALL,
	        data : call
	        });
	Ti.Android.currentActivity.startActivity(intent);
	
}


$.index.open();
