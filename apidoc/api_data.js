define({ "api": [
  {
    "type": "GET",
    "url": "/api/auth",
    "title": "Auth info",
    "name": "AuthCurrent",
    "group": "Auth",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "filename": "app/http/routes/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "PUT",
    "url": "/api/auth",
    "title": "Login user",
    "name": "AuthLogin",
    "group": "Auth",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "password",
            "description": "<p>User's password</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "POST",
    "url": "/api/auth",
    "title": "Register user",
    "name": "AuthRegister",
    "group": "Auth",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "name",
            "description": "<p>New user's name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>New user's email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "password",
            "description": "<p>New user's password</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "DELETE",
    "url": "/api/authors/:id",
    "title": "Delete author",
    "name": "AuthorsDestroy",
    "group": "Authors",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "GET",
    "url": "/api/authors?offset=10&search=abc",
    "title": "All authors",
    "name": "AuthorsIndex",
    "group": "Authors",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "search",
            "description": "<p>Text to search with</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "GET",
    "url": "/api/authors/:id",
    "title": "Single author",
    "name": "AuthorsShow",
    "group": "Authors",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Author's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "GET",
    "url": "/api/authors/:id/books?offset=10",
    "title": "Books of author",
    "name": "AuthorsShowBooks",
    "group": "Authors",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Author's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "POST",
    "url": "/api/authors",
    "title": "Create author",
    "name": "AuthorsStore",
    "group": "Authors",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "name",
            "description": "<p>New name</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "PUT",
    "url": "/api/authors/:id",
    "title": "Update author",
    "name": "AuthorsUpdate",
    "group": "Authors",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "name",
            "description": "<p>Updated name</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/authors.js",
    "groupTitle": "Authors"
  },
  {
    "type": "DELETE",
    "url": "/api/books/:id",
    "title": "Delete book",
    "name": "BooksDestroy",
    "group": "Books",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "GET",
    "url": "/api/books?offset=10&search=abc&authors=5ccb137f3e4d3a2290eca7fb&genres=5cc190db1b538c13d8d80abf,5cc190db1b538c13d8d80ac9",
    "title": "All books",
    "name": "BooksIndex",
    "group": "Books",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "search",
            "description": "<p>Text to search with</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "authors",
            "description": "<p>List of author ids</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "genres",
            "description": "<p>List of genre ids</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "GET",
    "url": "/api/books/:id",
    "title": "Single book",
    "name": "BooksShow",
    "group": "Books",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Book's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "POST",
    "url": "/api/books",
    "title": "Create book",
    "name": "BooksStore",
    "group": "Books",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "title",
            "description": "<p>New title</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "size": "20..",
            "optional": false,
            "field": "description",
            "description": "<p>New description</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0-infinity",
            "optional": false,
            "field": "price",
            "description": "<p>New price</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0-50",
            "optional": false,
            "field": "discount",
            "description": "<p>New discount</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "authors",
            "description": "<p>List of author ids related to book</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "genres",
            "description": "<p>List of genre ids related to book</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "POST",
    "url": "/api/books/:id/image",
    "title": "Store image for book",
    "name": "BooksStoreImage",
    "group": "Books",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Book's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "image",
            "description": "<p>Image file for book</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "POST",
    "url": "/api/books/:id",
    "title": "Update book",
    "name": "BooksUpdate",
    "group": "Books",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "title",
            "description": "<p>Updated title</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "size": "20..",
            "optional": false,
            "field": "description",
            "description": "<p>Updated description</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0-infinity",
            "optional": false,
            "field": "price",
            "description": "<p>Updated price</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0-50",
            "optional": false,
            "field": "discount",
            "description": "<p>Updated discount</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "authors",
            "description": "<p>List of author ids related to book</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "genres",
            "description": "<p>List of genre ids related to book</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/books.js",
    "groupTitle": "Books"
  },
  {
    "type": "DELETE",
    "url": "/api/cart/:id",
    "title": "Delete item from the cart of current user",
    "name": "CartDestroy",
    "group": "Cart",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Cart's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/cart.js",
    "groupTitle": "Cart"
  },
  {
    "type": "GET",
    "url": "/api/cart",
    "title": "Cart of current user",
    "name": "CartIndex",
    "group": "Cart",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "filename": "app/http/routes/cart.js",
    "groupTitle": "Cart"
  },
  {
    "type": "POST",
    "url": "/api/cart",
    "title": "Add item to cart of current user",
    "name": "CartStore",
    "group": "Cart",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0",
            "optional": false,
            "field": "count",
            "description": "<p>Count of books to add</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "book",
            "description": "<p>Book's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/cart.js",
    "groupTitle": "Cart"
  },
  {
    "type": "PUT",
    "url": "/api/cart/:id",
    "title": "Update item in the cart of current user",
    "name": "CartUpdate",
    "group": "Cart",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Cart's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0",
            "optional": false,
            "field": "count",
            "description": "<p>Count of books in cart</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/cart.js",
    "groupTitle": "Cart"
  },
  {
    "type": "DELETE",
    "url": "/api/genres/:id",
    "title": "Delete genre",
    "name": "GenresDestroy",
    "group": "Genres",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "GET",
    "url": "/api/genres?offset=10&search=abc",
    "title": "All genres",
    "name": "GenresIndex",
    "group": "Genres",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "search",
            "description": "<p>Text to search with</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "GET",
    "url": "/api/genres/:id",
    "title": "Single genre",
    "name": "GenresShow",
    "group": "Genres",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Genre's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "GET",
    "url": "/api/genres/:id/books?offset=10",
    "title": "Books by genre",
    "name": "GenresShowBooks",
    "group": "Genres",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Genre's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "POST",
    "url": "/api/genres",
    "title": "Create genre",
    "name": "GenresStore",
    "group": "Genres",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "name",
            "description": "<p>New name</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "PUT",
    "url": "/api/genres/:id",
    "title": "Update genre",
    "name": "GenresUpdate",
    "group": "Genres",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "6..",
            "optional": false,
            "field": "name",
            "description": "<p>Updated name</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/genres.js",
    "groupTitle": "Genres"
  },
  {
    "type": "PUT",
    "url": "/api/orders/:id",
    "title": "Delete order",
    "name": "OrdersDestroy",
    "group": "Orders",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Order's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/orders.js",
    "groupTitle": "Orders"
  },
  {
    "type": "GET",
    "url": "/api/orders?offset=10&user=5ccb137d3e4d3a2290eca641",
    "title": "All orders",
    "name": "OrdersIndex",
    "group": "Orders",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/orders.js",
    "groupTitle": "Orders"
  },
  {
    "type": "GET",
    "url": "/api/orders/current?offset=10",
    "title": "All orders of current user",
    "name": "OrdersIndexCurrent",
    "group": "Orders",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/orders.js",
    "groupTitle": "Orders"
  },
  {
    "type": "POST",
    "url": "/api/orders",
    "title": "Create order",
    "name": "OrdersStore",
    "group": "Orders",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "paymentType",
            "description": "<p>Database identifier of payment type</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/orders.js",
    "groupTitle": "Orders"
  },
  {
    "type": "PUT",
    "url": "/api/orders/:id",
    "title": "Update order",
    "name": "OrdersUpdate",
    "group": "Orders",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Order's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"in_progress\"",
              "\"done\""
            ],
            "optional": false,
            "field": "status",
            "description": "<p>Order status</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/orders.js",
    "groupTitle": "Orders"
  },
  {
    "type": "GET",
    "url": "/api/payment-types",
    "title": "All payment types",
    "name": "PaymentTypesIndex",
    "group": "PaymentTypes",
    "version": "1.0.0",
    "filename": "app/http/routes/paymentTypes.js",
    "groupTitle": "PaymentTypes"
  },
  {
    "type": "GET",
    "url": "/api/users?offset=10&name=abc&email=john@example.com",
    "title": "All users",
    "name": "UsersIndex",
    "group": "Users",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name to search with</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email to search with</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "GET",
    "url": "/api/users/:id",
    "title": "Single user",
    "name": "UsersShow",
    "group": "Users",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User's database identifier</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "GET",
    "url": "/api/users/:id/orders?offset=10",
    "title": "Orders by user",
    "name": "UsersShowOrders",
    "group": "Users",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User's database identifier</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Number of results to skip</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "PUT",
    "url": "/api/users/:id",
    "title": "Update user",
    "name": "UsersUpdate",
    "group": "Users",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsAdmin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Updated user's name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Updated user's email</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "size": "0-50",
            "optional": false,
            "field": "discount",
            "description": "<p>Updated user's discount</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "PUT",
    "url": "/api/users",
    "title": "Update current user",
    "name": "UsersUpdateCurrent",
    "group": "Users",
    "version": "1.0.0",
    "permission": [
      {
        "name": "IsLoggedIn"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>User's JWT access token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Updated user's name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Updated user's email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Updated user's password</p>"
          }
        ]
      }
    },
    "filename": "app/http/routes/users.js",
    "groupTitle": "Users"
  }
] });
