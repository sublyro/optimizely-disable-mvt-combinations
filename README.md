# optimizely-disable-mvt-combinations
Ability to disable MVT combination 


A few of my customers have asked for the ability to disable certain combinations of variations in MVT experiments. This is not currently supported in the product but this can be achieved using Project JS and manual bucketing.
I delivered a solution to 2 of my customers (Qapa & LeLynx)

All you need to do is modify the top part
window.opty_mvt.push(
{ id: 3265190066, disabled_combinations: ['2 0', '2 1', '0 1', '2 2', '1 1', '0 2', '1 0'] }
);

Just replace the id with your experiment id and update the list of combinations that should be disabled (using a space separated list of variation index)
For example to disable
Original, Variation 1
Original, Variation 3
use 
'0 1', '0 3'

This bucketing only applies to NEW visitors. Visitors that are already bucketed will stay in that bucket even if the combination is disabled