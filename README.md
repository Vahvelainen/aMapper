# aMapper
 Browser based Ai Affinity mapper tool

Last features to add before aestethics and usability and expalanations:

filtering out of special characters from words and documents for TH-IDF and K-mean, Done!

Returning documents as they were, Done!

writing out each documents distance from cluster centroid, this can be used to visually represent "heat" or revelevance of each doc, Done! but seems to be a little useless for now 0-2 green 2-3 orange 3-5 red (5 very very red)

letting user choose the data splitter from options
Done! Also refactored splitting and flitering functions a little

maybe: TF-IDF and KMeans to objects