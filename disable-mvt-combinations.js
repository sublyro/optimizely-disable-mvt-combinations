// COPY THIS CODE TO PROJECT JS

window.opty_mvt = [];
window.opty_mvt.push({
  id: 3265190066,
  disabled_combinations: ['2 0', '2 1', '0 1', '2 2', '1 1', '0 2', '1 0']
});

window.opty_mvt.push({
  id: 3278230212,
  disabled_combinations: ['2 0 0', '1 1 1', '1 0 1', '0 0 0', '2 1 0', '2 1 1']
});


if (typeof DATA != 'undefined') {
  (function(DATA) {
    'use strict';
    
    /**
    * Manually bucket the visitor to a random combination
    */
    function bucketVisitor(obj) {
      var section_ids = DATA.experiments[obj.id].section_ids;
      obj.sections = [];
      obj.bucket = [];
      for (var i = 0; i < section_ids.length; i++) {
        var sid = section_ids[i];
        obj.sections.push(DATA.sections[sid].variation_ids);
        obj.bucket.push(Math.floor((Math.random() * DATA.sections[sid].variation_ids.length)));
      }
    }

    /**
    * Check wether or not the chosen bucket is valid
    */
    function isValidBucket(obj) {
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
      console.log("Experiment " + obj.id + " is not set to run on this page");
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
      DATA.audiences[aid].conditions[2] = level2;
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
       while (ready === false) { // run the bucketing
        bucketVisitor(obj);
        var isValid = isValidBucket(obj);
        if (isValid === true) {
          ready = true;
          for (var i = 0; i < obj.bucket.length; i++) {
            window['optimizely'].push(["bucketVisitor", obj.id, obj.sections[i][obj.bucket[i]]]);
          }
        }
      } // else rebucket
    }

    /**
    * Run the bucketing during audience evaluation
    * This function always returns true to prevent having any impact on the actual audience
    */
    function bucketFromAudience(eid) {
      var ready = false;

      var obj = null;
      // Look for the experiment in the config
      for (var key in window.opty_mvt) {
        obj = window.opty_mvt[key];
        if (obj.id == eid) {
          break;
        }
      }

      if (obj === null) {
        return true; //invalid config?
      }

      // bucket the visitor
      findBucket(obj);

      // return true so visitor is in audience
      return true;
    }

    // expose the bucketing function so it can be added to the audience
    window.bucketFromAudience = bucketFromAudience;

    // TODO Make sure this id does not exist
    if (typeof DATA.dimensions['1234567890'] === 'undefined') {
      DATA.dimensions['1234567890'] = {
        condition_type: 'code'
      };
    }

    for (var key in window.opty_mvt) {
      var obj = window.opty_mvt[key];
      console.log(obj);
      if (shouldRunBucketing(obj)) {
        bucketMVT(obj);
      }
    }

  })(DATA);
}
