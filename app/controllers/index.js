
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
		var url = "http://up637415.co.uk/node.json?field_premium_number=" + number;
		var json;
		
		var xhr = Ti.Network.createHTTPClient({
			onload: function() {
			// parse the retrieved data, turning it into a JavaScript object
			json = JSON.parse(this.responseText);
			Ti.API.info(json);
			// ...
			}
		});
		
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
