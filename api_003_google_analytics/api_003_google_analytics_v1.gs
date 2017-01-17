/********************************************************************************
 * 
 * API experiments 2017 #003
 * Exploring the Google Analytics API
 * Retrives GA data and populates a Google Sheet
 * Apps Script Advanced Service
 * 
 */


// setup menu to run print Mailchimp function from Sheet
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Google Analytics Menu')
    .addItem('Get Analytics data', 'gaReport')
    .addToUi();

}


// script properties service
// retrive copy of ga profile id
function getProfileId() {  
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty('gaProfileId');
}

// get the dates from the Sheet
function getDates() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("workings");
  
  var chosenPeriod = sheet.getRange(7,2).getValue();
  var today = new Date();
  
  // use Object literal approach instead of switch or if/else for this lookup
  var startDateCalculator = function(n) {  
    return new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
  }
  
  var periods = {
    'Last 7 days': function() {
      return [today, startDateCalculator(7)];
    },
    'Last 14 days': function() {
      return [today, startDateCalculator(14)];
    },
    'Last 30 days': function() {
      return [today, startDateCalculator(30)];
    },
    'Last Quarter': function() {
      return [today, startDateCalculator(14)];
    },
    'Year To Date': function() {
      return [today, new Date(today.getFullYear(),0,1)];
    },
    'Last Year': function() {
      return [new Date(today.getFullYear()-1,11,31), new Date(today.getFullYear()-1,0,1)];
    },
    'Custom Range': function() {
      var startDateChosen = sheet.getRange(9,2).getValue();
      var endDateChosen = sheet.getRange(10,2).getValue();
      return [startDateChosen,endDateChosen];
    }
  };
  
  
  
  Logger.log(chosenPeriod);
  Logger.log(periods[chosenPeriod]());
  
}


// run Google Analytics report
function gaReport() {
  
  var profileId = getProfileId();
  
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  var startDate = Utilities.formatDate(oneWeekAgo, Session.getScriptTimeZone(),
      'yyyy-MM-dd');
  
  
  
  var endDate = Utilities.formatDate(today, Session.getScriptTimeZone(),
      'yyyy-MM-dd');

  var tableId  = 'ga:' + profileId;
  var metric = 'ga:visits';
  var options = {
    'dimensions': 'ga:deviceCategory',
    'sort': '-ga:visits',
    'filters': 'ga:medium==organic',
    'max-results': 25  // actually redundant in this example with deviceCategory
  };
  
  var report = Analytics.Data.Ga.get(tableId, startDate, endDate, metric,
      options);
  
  //Logger.log(report["query"]);
  // [[desktop, 4215], [mobile, 224], [tablet, 57]]
  // {end-date=2017-01-15, max-results=25, start-index=1, ids=ga:93306374, 
  // start-date=2017-01-08, sort=[-ga:visits], filters=ga:medium==organic, 
  // metrics=[ga:visits], dimensions=ga:deviceCategory}
  
  displayGAData(report);
  
  
}


// display output in Google Sheet
function displayGAData(data) {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Output");
  
  var timestamp = new Date();
  
  var output = [
    timestamp,
    data["query"]["dimensions"],
    data["query"]["metrics"][0],
    data["query"]["filters"],
    data["query"]["start-date"],
    data["query"]["end-date"],
    data["rows"][0][1],
    data["rows"][1][1],
    data["rows"][2][1]
  ];
  
  Logger.log(output);
  
  sheet.appendRow(output);
  
}