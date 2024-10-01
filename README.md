# aMapper
    
Browser based Ai Affinity mapper tool
=====================================

note: Code is very much in a work in progress and has some weirdness caused mainly by lack of experience in programming and laziness. I migh or migh not to clean the repo in the near future.

update 2024: weidness in code may still exist in algorithms but the repo is slightly cleaned up. Everything relevant can be found in the ```/public``` directory.

### What?

*   Ai based affinity mapping tool
*   Tool goups input documents (ie. customer feedback) into similiar themes
*   Algorithm used is Spherical K-means mapping with TF-IDF vectorization
*   All in your browser window: no data is transferred trough internet

### How?

*   Copy paste your raw text data into input field
*   Select character that separates different parts (documents) in raw data
*   Choose how many clusters you want the data to be grouped into
*   Press "Map!" Button to run the grouping algorithm
*   Navigate between clusters with "prev" and "next" buttons
