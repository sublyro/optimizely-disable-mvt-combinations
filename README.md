# optimizely-disable-mvt-combinations
Ability to disable MVT combination 

All you need to do is modify the config part (line 6)
window.optly_mvt.push([{"id":4053480045, "disabled_combinations":["4042040132 4051590088","4042040132 4051610041","4044060133 4047950063","4044060133 4051590088","4044060133 4051610041","4052790055 4047950063","4055370049 4047950063","4055370049 4051610041"]},{"id":4055784970, "disabled_combinations":["4037028895 4042189221 4058838952","4037028895 4042189221 4069534828"]}]);

- 'id' is the Experiment Id which you can see in the URL of the experiment
- 'disabled_combinations' is a list of combinations to disable. You can find the Variation Ids in the diagnostic window of the Editor

This bucketing only applies to NEW visitors. Visitors who are already bucketed will stay in that bucket even if the combination is disabled
