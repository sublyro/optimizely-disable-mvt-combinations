// COPY THIS CODE TO PROJECT JS 
// Warning! This won't work for experiments set to manual or conditional activation that won't get activated, if they have a shared audience and and the
// You need to modify line 6 with experiment id and variation id.
// You can find the variation id on the diagnostic screen

window.optly_mvt = [];
window.optly_mvt.push([{"id":4053480045, "disabled_combinations":["4042040132 4051590088","4042040132 4051610041","4044060133 4047950063","4044060133 4051590088","4044060133 4051610041","4052790055 4047950063","4055370049 4047950063","4055370049 4051610041"]},{"id":4055784970, "disabled_combinations":["4037028895 4042189221 4058838952","4037028895 4042189221 4069534828"]}]);
window.optly_mvt = window.optly_mvt[0];

if (typeof DATA != 'undefined') {
  (function (DATA) {
    'use strict';

    /**
    * Manually bucket the visitor to a random combination
    */
    function bucketVisitor(obj) {
      console.log("bucket visitor " + obj.id);
      var section_ids = DATA.experiments[obj.id].section_ids;
      obj.sections = [];
      obj.bucket = [];
      for (var i = 0; i < section_ids.length; i++) {
        var sid = section_ids[i];
        obj.sections.push(DATA.sections[sid].variation_ids);
        var r = Math.floor((Math.random() * DATA.sections[sid].variation_ids.length));
        obj.bucket.push(DATA.sections[sid].variation_ids[r]);
      }
    }

    /**
    * Check wether or not the chosen bucket is valid
    */
    function isValidBucket(obj) {
      console.log("Is valid bucket? " + obj.id);
      for (var i = 0; i < obj.disabled_combinations.length; i++) {
        if (obj.disabled_combinations[i] == obj.bucket.join(" ")) {
          console.log("Invalid combination " + obj.bucket.join(" "));
          return false;
        }
      }
      console.log("Valid combination " + obj.bucket.join(" "));
      return true;
    }

    /**
    * return true if we should run the bucketing 
    */
    function shouldRunBucketing(obj) {      
      if (DATA.experiments[obj.id] === undefined) {
        // experiment does not exists
        return false; 
      }
      
      // check if the visitor is already bucketed
      if (document.cookie.indexOf(obj.id) > -1) {
        return false;
      }
      
      var experiment = DATA.experiments[obj.id];
      // make sure the experiment is running
      if (experiment === null || experiment.enabled !== true) {
        return false;
      }
            
      // validate the URL targeting
      var page = document.URL;
      for (var i = 0; i < experiment.urls.length; i++) {
        var pageURL = experiment.urls[i];
        if (pageURL.match == 'simple' && simpleMatch(page, pageURL.value)) {
          return true;
        } else if (pageURL.match == 'substring' && substringMatch(page, pageURL.value)) {
          return true;
        } else if (pageURL.match == 'exact' && exactMatch(page, pageURL.value)) {
          return true;
        } else if (pageURL.match == 'regex' && regexMatch(page, pageURL.value)) {
          return true;
        }
      }
      return false;
    }


    function simpleMatch(url1, url2) {
      url1 = url1.replace("http://", "").replace("https://", "").replace("www.", "");
      url1 = url1.indexOf('?') > -1 ? url1.substring(0, url1.indexOf('?')) : url1;
      url1 = url1.lastIndexOf('/') == (url1.length - 1) ? url1.substring(0, url1.lastIndexOf('/')) : url1;
      url2 = url2.replace("http://", "").replace("https://", "").replace("www.", "");
      url2 = url2.indexOf('?') > -1 ? url2.substring(0, url2.indexOf('?')) : url2;
      url2 = url2.lastIndexOf('/') == (url2.length - 1) ? url2.substring(0, url2.lastIndexOf('/')) : url2;
      return url1 == url2;
    }

    function exactMatch(url1, url2) {
      url1 = url1.replace("http://", "").replace("https://", "").replace("www.", "").replace("/?", "?");
      url1 = url1.lastIndexOf('/') == (url1.length - 1) ? url1.substring(0, url1.lastIndexOf('/')) : url1;
      url2 = url2.replace("http://", "").replace("https://", "").replace("www.", "").replace("/?", "?");
      url2 = url2.lastIndexOf('/') == (url2.length - 1) ? url2.substring(0, url2.lastIndexOf('/')) : url2;
      return url1 == url2;
    }

    function substringMatch(url1, url2) {
      url1 = url1.lastIndexOf('/') == (url1.length - 1) ? url1.substring(0, url1.lastIndexOf('/')) : url1;
      url2 = url2.lastIndexOf('/') == (url2.length - 1) ? url2.substring(0, url2.lastIndexOf('/')) : url2;
      return url1.indexOf(url2) != -1;
    }

    function regexMatch(url1, url2) {
      return url1.match(url2) !== null;
    }

    /**
     * Check whether the visitor passes experiment traffic allocation
     */
    function testTrafficAllocation(obj) {
      if (DATA.experiments[obj.id].ignore !== undefined) { // if traffic allocation is less than 100%
        var passTrafficAllocation = Math.floor((Math.random() * 10000) >= DATA.experiments[obj.id].ignore);
        return Boolean(passTrafficAllocation);
      } else {
        return true;
      }
    }

    function getAudience(obj) {
      if (DATA.experiments[obj.id].audiences === undefined) {
        return null;
      }
      return DATA.experiments[obj.id].audiences;
    }

    /**
    * Add a custom JS to the audience condition to bucket the visitor
    */
    function updateAudience(obj, aid) {
      var advanced_js = {
        dimension_id: 1234567890,
        value: "window.bucketFromAudience(" + obj.id + ");"
      };
      var level1 = ["or", advanced_js];
      var level2 = ["or", level1];
      DATA.audiences[aid].conditions[DATA.audiences[aid].conditions.length] = level2;
    }

    /** 
    * Run the bucketing code for the experiment
    * The bucketing will run either now if the experiment has no audience 
    * or during the audience evaluation
    */
    function bucketMVT(obj) {
        var ready = false;
        // check if this experiment has an audience
        var audiences = getAudience(obj);
        if (audiences === null) {
          // no audience so perform the bucketing now
          findBucket(obj);
        } else {
          // the experiment has at least one audience so we need to add the bucketing code to it
          // bucketing will happen at the time the audience is evaluated
          for (var aid in audiences) {
            updateAudience(obj, audiences[aid]);
          }
        }
    }
    
    /**
    * Manually bucket the visitor in a valid MVT combination
    */
    function findBucket(obj) {
      var ready = false;
      window['optimizely'] = window['optimizely'] || [];
      var passTrafficAllocation = testTrafficAllocation(obj);
      if (passTrafficAllocation) { // passes traffic allocation so bucket
        while (ready === false) { // run the bucketing
          bucketVisitor(obj);
          var isValid = isValidBucket(obj);
          if (isValid === true) {
            ready = true;
            for (var i = 0; i < obj.bucket.length; i++) {
              window['optimizely'].push(["bucketVisitor", obj.id, obj.bucket[i]]);
            }
          }
        } // else rebucket
      } else { // doesn't pass traffic allocation so permanently ignore the experiment
        window['optimizely'].push(["bucketVisitor", obj.id, 0]); 
      }
    }

    /**
    * Run the bucketing during audience evaluation
    * This function always returns true to prevent having any impact on the actual audience
    */
    function bucketFromAudience(eid) {
      var ready = false;

      var obj = null;
      // Look for the experiment in the config
      for (var key in window.optly_mvt) {
        obj = window.optly_mvt[key];
        if (obj.id == eid) {
          break;
        }
      }

      if (obj === null) {
        return true; //invalid config?
      }

      // bucket the visitor
      findBucket(obj);

      // return true so audience evaluates to true
      return true;
    }

    // expose the bucketing function so it can be added to the audience
    window.bucketFromAudience = bucketFromAudience;

    // create a dummy audience condition of type code
    // TODO Make sure this id does not exist
    if (typeof DATA.dimensions['1234567890'] === 'undefined') {
      DATA.dimensions['1234567890'] = {
        condition_type: 'code'
      };
    }

    // run the bucketing
    for (var key in window.optly_mvt) {
      var obj = window.optly_mvt[key];
      if (shouldRunBucketing(obj)) {
        bucketMVT(obj);
      }
    }

  })(DATA);
}
