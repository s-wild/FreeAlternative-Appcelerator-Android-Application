# *"FreeAlternative"* Android Application Final Year Project
By: up637415@myport.ac.uk

This applications objective is to help users avoid premium rate telephone numbers.
Additionally, the application connects to a Drupal 7 web service:
http://www.freealternative.co.uk

## Modules/Widgets
- TelephonyManager from http://gitt.io/component/com.goyya.telephonymanager.
- Star Rating Widget from
https://github.com/AppceleratorSolutions/AlloyWidgets/tree/master/starrating

## Appcelerator Controllers
- app/controllers/index.js, first page that opens. Contains search feature for
filtering telephone numbers.
- app/controllers/numberOptions.js, when a user clicks a telephone number button
, this page will be loaded containing all of the options.
- app/controllers/telephonePricing.js, generates pricing for a telephone number.

#### Installation
Module dependancies can be installed using:

```
gittio install -g
```
Additionally, seperate modules can be installed using:
```
gittio install -g gittio install com.goyya.telephonymanager
```

The application requires Titanium Appcelerator in order to run. Open the root
directory in Appcelerator Platform (https://platform.appcelerator.com/) to
run the application. 
