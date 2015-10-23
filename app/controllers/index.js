
var textField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 50, left: 10,
  width: 360, height: 60,keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD,
  softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
});
$.index.add(textField);

function doClick(e) {
    alert(textField.value.length);
}

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
				
			    Ti.API.log("Telephone Field:::   " + entry);
			    var callButton = Titanium.UI.createButton({
			        top : "130dp",
			        width : "96%",
			        height : "60dp",
			        title : entry,
			        font: {fontSize: '30'},
			    });
			    $.index.add(callButton);
			    var call = 'tel: ' + entry;
				var intent = Ti.Android.createIntent({
				        action : Ti.Android.ACTION_CALL,
				        data : call
				        });
				// Ti.Android.currentActivity.startActivity(intent);
			});
			
			
			}
		});
		
        // Open URL.		
		xhr.open("GET", url); 
		xhr.send();
		
		
	
	}
        
});


$.index.open();
