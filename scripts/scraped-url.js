// constructor function for creating student objects
/* possible config props
  {
    siteName: "site name",
    site: "site url",
    sort: "sort metric",
    sdate: Date,
    edate: Date,
    dateMetric: "date string", (ie 24 hours, 1 week, 1 month)
  }
*/
var ScrapedUrl = function(siteName, term, config) {
    this.siteName = siteName;
    this.term = term;
    this.config = config;
    switch(siteName.trim().toLowerCase()){
      case "new york times":
      case "newyorktimes":
       this.siteUrl = "https://www.nytimes.com";
        this.url = buildNytUrl(term, config.sort, config.edate, config.sdate);
        this.buildUrl =  buildNytUrl;
        break;
      case "washington post":
      case "washingtonpost":
        //TODO wapo code
        break;
      default:
        throw new Error("Invalid site name passed to ScrapedUrl constructor");
    }

  };

  function buildNytUrl(term, sort, edate, sdate){
    var url = "https://www.nytimes.com/search?";
    var sdate = dateAs8LengthString(new Date(sdate));
    var edate = dateAs8LengthString(new Date(edate));
    if(edate){
        url += "endDate="+edate+"&query="+term;
    }else{
        url += "query="+term;
    }
    if(sort){
        url += "&sort="+sort;
    }
    if(sdate){
        url += "&startDate="+sdate;
    }
    return encodeURI(url);
  }

function dateAs8LengthString(date){
  var year = ""+date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  if(month<10){
      month = "0"+month;
  }
  if(day<10){
      day = "0"+day;
  }
  return year+month+day;
}
  
  // exporting our Student constructor
  module.exports = ScrapedUrl;
  