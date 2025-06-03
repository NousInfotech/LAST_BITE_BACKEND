| Filter Field       | Type               | Description                                       | Example Values                   | Notes                              |
|--------------------|--------------------|-------------------------------------------------|---------------------------------|-----------------------------------|
| restaurantName     | string             | Filter by restaurant name (exact or regex)      | `"Spice Symphony"`, `/Spice/i`  | Use regex for case-insensitive search |
| typeOfFood         | string or string[] | Food type(s)                                    | `"veg"`, `"non_veg"`, `["veg","non_veg"]` | Array values treated as OR        |
| isActive           | boolean            | Filter active/inactive restaurants               | `true`, `false`                 |                                   |
| rating             | number or object   | Filter by rating or rating range                  | `4.5`, `{ $gte: 4 }`           | Supports MongoDB query operators  |
| cuisines           | string or string[] | Filter by cuisine(s)                              | `"Italian"`, `["Indian","Mexican"]` |                                   |
| tags               | string or string[] | Tags associated with restaurant                   | `"family"`, `["romantic","cozy"]` |                                   |
| availableCategories| string or string[] | Categories available                              | `"dessert"`, `["drinks","appetizers"]` |                                   |
| search             | string             | Search substring (case-insensitive) on restaurantName | `"spice"`                      | Uses regex internally              |
| page               | number (string ok) | Pagination page number                            | `1`, `2`                       | Used for skip calculation          |
| limit              | number (string ok) | Number of results per page                        | `10`, `20`                     |                                   |
| sortBy             | string             | Field to sort by                                  | `"rating"`, `"restaurantName"` |                                   |
| order              | string             | Sort order: `"asc"` or `"desc"`                   | `"asc"`, `"desc"`              |                                   |
