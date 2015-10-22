
var textField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 10, left: 10,
  width: 250, height: 60,keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD
});
$.index.add(textField);

function doClick(e) {
    alert(textField.value.length);
}

// var phonebox = $.phonesearch;
textField.addEventListener('change', function(e){
	var phoneSearchValue = textField.value;
	// var indexValue = indexOf.phoneSearchValue;
	// alert(indexValue);
	if (phoneSearchValue.length == 11) {
		// alert(phoneSearchValue);
		var number = phoneSearchValue;
		
		// Set JSON URL. 		
		var url = "http://up637415.co.uk/node.json?field_premium_number=0870 070 0191";
		var json;
		
		var xhr = Ti.Network.createHTTPClient({
			
			onload: function() {
			Ti.API.log("JSON:::  " + this.responseText);  
			// parse the retrieved data, turning it into a JavaScript object
			var json = JSON.parse(this.responseText);
			var json_free_phone_numbers = json['list']['0']['field_free_phone'];
			
			// var free_phone_fields = JSON.stringify(json['list']['0']['field_free_phone']);
			
			json_free_phone_numbers.forEach(function(entry) {
			    Ti.API.log("Telephone Field:::   " + entry);
			});
			
			
			}
		});
		
		xhr.open("GET", url); 
		
		xhr.send();
		
		// Initiate call.
		
		var call = 'tel:' + number;
		var intent = Ti.Android.createIntent({
		        action : Ti.Android.ACTION_CALL,
		        data : call
		        });
		// Ti.Android.currentActivity.startActivity(intent);
	
	}
        
});



$.index.open();
