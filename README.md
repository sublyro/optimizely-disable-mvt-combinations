# optimizely-disable-mvt-combinations
Ability to disable MVT combination 


A few of my customers have asked for the ability to disable certain combinations of variations in MVT experiments. This is not currently supported in the product but this can be achieved using Project JS and manual bucketing.
I delivered a solution to 2 of my customers (Qapa & LeLynx)

All you need to do is modify the top part
window.optly_mvt.push([{"id":4053480045, "disabled_combinations":["4042040132 4051590088","4042040132 4051610041","4044060133 4047950063","4044060133 4051590088","4044060133 4051610041","4052790055 4047950063","4055370049 4047950063","4055370049 4051610041"]},{"id":4055784970, "disabled_combinations":["4037028895 4042189221 4058838952","4037028895 4042189221 4069534828"]}]);

You can find the Variation IDs on the diagnostic window in the Editor

This bucketing only applies to NEW visitors. Visitors that are already bucketed will stay in that bucket even if the combination is disabled
