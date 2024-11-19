# Avoca API

Referred from https://docs.housecallpro.com/docs/housecall-public-api/a4ca20a18010c-housecall-v1-api

Note that in order to use the standard [@openapitools/openapi-generator-cli](https://www.npmjs.com/package/@openapitools/openapi-generator-cli), some minor changes to the Housecall API spec were necessary. These included:

- Several `schema` objects of type `array` were missing an `items` key; these were mostly on `GET` request query parameter definitions for the `expand` and `*_ids` query arrays. The `items` keys were added manually.
- The CLI client does not support spaces in the regular expression validation for `securitySchemes` object keys, so the spaces were removed on the `Company API Key` definition and related definitions.
- The `Get Jobs` operation had erroneously included an `requestBody` definition, which was removed.
- The `Delete appointment` operation had erroneously `requestBody` definition, which was removed.
