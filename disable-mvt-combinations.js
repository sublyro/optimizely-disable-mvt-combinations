// COPY THIS CODE TO PROJECT JS

window.opty_mvt = [];

// UPDATE THE FOLLOWING LINE WITH EXPERIMENT ID AND COMBINATIONS TO DISABLE
window.opty_mvt.push({
    id: 3265190066,
    disabled_combinations: ['2 0', '2 1', '0 1', '2 2', '1 1', '0 2', '1 0']
});

window.opty_mvt.push({
    id: 3278230212,
    disabled_combinations: ['2 0 0', '1 1 1', '1 0 1', '0 0 0', '2 1 0', '2 1 1']
});

// DO NOT MODIFY BELOW THIS LINE
if (typeof DATA != 'undefined') {
    (function (DATA) {
        'use strict';

        function bucketVisitor(obj) {
            var section_ids = DATA.experiments[obj.id].section_ids;
            obj.sections = [];
            obj.bucket = [];
            for (i = 0; i < section_ids.length; i++) {
                var sid = section_ids[i];
                obj.sections.push(DATA.sections[sid].variation_ids);
                obj.bucket.push(Math.floor((Math.random() * DATA.sections[sid].variation_ids.length)));
            }
        }

        function isValidBucket(obj) {
            for (i = 0; i < obj.disabled_combinations.length; i++) {
                if (obj.disabled_combinations[i] == obj.bucket.join(" ")) {
                    console.log("Invalid combination " + obj.bucket.join(" "));
                    return false;
                }
            }
            console.log("Valid combination " + obj.bucket.join(" "));
            return true;
        }

        function bucketMVT(obj) {
            if (document.cookie.indexOf(obj.id) == -1) {
                var ready = false;
                while (ready === false) {
                    bucketVisitor(obj);
                    var isValid = isValidBucket(obj);
                    if (isValid === true) {
                        ready = true;
                        for (i = 0; i < obj.bucket.length; i++) {
                            window['optimizely'].push(["bucketVisitor", obj.id, obj.sections[i][obj.bucket[i]]]);
                        }
                    }
                }
            } // else user is already bucketed
        }

        // disable some MVT combinations for the given experiment
        window['optimizely'] = window['optimizely'] || [];
        for (var key in window.opty_mvt) {
            var obj = window.opty_mvt[key];
            bucketMVT(obj);
            console.log(obj);
        }

    })(DATA);
}