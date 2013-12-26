// traversing specific AdWords campaigns and applying labels to AdWords keywords automatically

function main() {

  initialiseLabels();

  var myCampaigns = AdWordsApp.campaigns().withCondition("Status = ENABLED").orderBy("Name ASC").get(); // .withCondition("Name STARTS_WITH_IGNORE_CASE 'auto '")
  while (myCampaigns.hasNext()) {
    var campaign = myCampaigns.next();
    var myKeywords = campaign.keywords().withCondition("Status = ENABLED").get()
    
    while (myKeywords.hasNext()) {
      var boolKeywordDataTrusted = true;
      
      var keyword = myKeywords.next();

      var stats7Days = keyword.getStatsFor('LAST_7_DAYS');
      // var statsYesterday = keyword.getStatsFor('YESTERDAY');
      // var statsToday = keyword.getStatsFor('TODAY');

      var intConversions7Days = stats7Days.getConversions();
      var costPerConversion7Days = (stats7Days.getCost() / intConversions7Days);

      // determining the current CPC fails in cases where there is no CPC set, like for example in Campaign Optimizer managed campaigns
      // to avoid the error exception handling would be a possible solution but unfortunately exception handling slows the script down dramatically
      // therefore the myCampaigns iterator should be restricted to campaigns that will traverse only such campaigns that are suitable if a current CPC is needed
      // see above for an example "withCondition()" I use - I name campaigns that should be automated starting with "AUTO"
      // you could also use labels to indicate which campaigns are to be treated in automated ways - allowing for differentiated and mixed automation levels
      var dblCurrentMaxCPC = 0.0;
      dblCurrentMaxCPC = keyword.getMaxCpc();
      //try { dblCurrentMaxCPC = keyword.getMaxCpc(); } catch(err) { boolKeywordDataTrusted = false };

      var dblFirstPageCPC = keyword.getFirstPageCpc();
      var intQualityScore = keyword.getQualityScore();

      if (boolKeywordDataTrusted = true) {

        // apply the "BID+" label for 1st page CPC
        if (dblCurrentMaxCPC < dblFirstPageCPC) {
          if (hasLabel(keyword, 'BID+')) { /* has the label already */ } else { keyword.applyLabel('BID+'); }
        }

      } else {
        // this keyword's data is not trusted - could be that a max CPC is not known (for bidding types that are automated)
        // first page CPC might not be obtaintable
      }
    }
  }
}

function initialiseLabels() {
    // remove and re-create the BID+ labels
  var labels = AdWordsApp.labels().withCondition("LabelName = 'BID+ 7_1stPage'").get();
  if (labels.hasNext()) {
    var label = labels.next();
    // label exists
    label.remove();
  }
  AdWordsApp.createLabel("BID+", "Automated BETA: Increase bid to appear on 1st page.", "#080");
}

function hasLabel(keyword, label) {
 return keyword.labels().withCondition("Name = '" + label + "'").get().hasNext();
}