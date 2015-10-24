var textField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 50, left: 10,
  width: 360, height: 60,keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD,
  softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
});
$.index.add(textField);

// Hide no result label on load.
noResults = $.noResults;
noResults.hide(); 

// Activity indication loader.
var activity=Ti.UI.createActivityIndicator({
    message:'Loading..'
});
$.index.add(activity);

textField.addEventListener('change', function(e){
	
    // 	Get phoneSearchValue.
	var phoneSearchValue = textField.value;
	Ti.API.log(phoneSearchValue.length);
	
    // 	Check if value is a phone number. 
	if (phoneSearchValue.length == 11) {
		var scrollView = Ti.UI.createScrollView({
		    contentWidth:'auto',
		    contentHeight:'auto',
		    left: 0, 
		    right: 0,
		    height:240,
		    top:125,
		    backgroundColor:'transparent',
		    layout: 'vertical'
		});
		call_buttons = [];
		$.index.add(scrollView);
 
		var number = phoneSearchValue;
		
		// Set JSON URL. 		 
		var url = "http://up637415.co.uk/node.json?field_premium_number=" + number;
		var json;
		
        // Get contents from URL. 		
		var xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload: function() {

				Ti.API.log("JSON:::  " + this.responseText);  
				jsonText = this.responseText;
				
				// parse the retrieved data, turning it into a JavaScript object
				var json = JSON.parse(this.responseText);

				jsonList = JSON.stringify(json['list']);
				if (jsonList.length > 2) {
					
					Ti.API.log("Somethign is in the array!!!");
					var json_free_phone_numbers = json['list']['0']['field_free_phone'];  
	
					Ti.API.log("Field_FREE_PHONE:::  " + json_free_phone_numbers);  
		
		            // Iterate over each result. Generate button to call. 	
		            var index;
		            topprop = 0.1; // this is space between two labels one below the other
					for (index = 0; index < json_free_phone_numbers.length; ++index) {
						var call_buttons = Titanium.UI.createButton({
							id: json_free_phone_numbers[index],
					        top: 15+ index * topprop,
					        width : "94%",
					        height : "60dp",
					        title : json_free_phone_numbers[index],
					        font: {fontSize: '30'},
					    });
		
					    scrollView.add(call_buttons);
					    call_buttons.addEventListener('click', callNowButton); 
					    
					}
				}
				else {
					noResults.show(); 
					
				}
			},
			 // function called when an error occurs, including a timeout
		     onerror : function() {
		         Ti.API.log("Error:::  ERRORRR!!!!!!!");
		     },
		     timeout : 5000  // in milliseconds
		});
		
        // Open URL.		
		xhr.open("GET", url); 
		xhr.send();
	
	}
	else {
		noResults.show();
	}
        
});
 
// Call now button.
function callNowButton(id, call_button_number) {

	Ti.API.info('Call function id: '+ this.id);  

	var call = 'tel: ' + this.id;
	// Ti.API.info('Call'+ call);
	var intent = Ti.Android.createIntent({
	        action : Ti.Android.ACTION_CALL,
	        data : call
	        });
	Ti.Android.currentActivity.startActivity(intent);
	
}



$.index.open();
