## Public resources
* css, scripts, fonts, static images like favicon or logo
* Cache for 1 year, public, weak ETag, stale resource allowed.
* Example:
    ```
    Cache-Control: public, max-age=31536000
    ETag: W/"368d-15cc3a03146"
    ```
* Expected test result: 
  * status `200`
  * from local cache
  * have `Cache-Control: public, max-age=31536000`
  * have ETag

## Relatively static resources
* Images for albums or artists  
  Not-so-dynamic pages (browse artists, artist page, 404)
* Cache for 1 day, public, weak ETag, stale resource allowed.
* Example:
    ```
    Cache-Control: public, max-age=86400 
    ETag: W/"1885-jF9p9OVGhOjPGOXRlQu9TnQ+l0c"
    Expires: Thu, 29 Jun 2017 02:45:31 GMT
    ```
* Expected test result: 
  * status `200`
  * from local cache
  * have `Cache-Control: public, max-age=86400`
  * have `Expires: ...` (only for old browser compatibility)
  * have ETag

## Dynamic pages
* Index, browse albums, album page
* Re-validate before using cached resource, public, weak ETag, stale resource not allowed.
* Example:
  ```
  Cache-Control: public, no-cache, must-revalidate
  ETag: W/"1d97-t1Wdzs8mP0OTMek25jjTJosI/QY"
  ```
* Expected test result: 
  * status `304` if not modified, or `200` if modified
  * from local cache if not modified, or from server if modified
  * have `Cache-Control: public, no-cache, must-revalidate`
  * have ETag

## Private content
* Orders page, checkout page
* No cache, no store, private, stale resource not allowed
* Example:
  ```
  Cache-Control: private, no-cache, no-store, must-revalidate
  ```
* Expected test result:
  * status `200`
  * from server
  * have `Cache-Control: private, no-cache, no-store, must-revalidate`
