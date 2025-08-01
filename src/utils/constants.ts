import { IHTTPStatusCodes, Role } from "../domain/interfaces/utils.interface.js";

export const HTTP: IHTTPStatusCodes = {
    // 1xx - Informational
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,

    // 2xx - Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,

    // 3xx - Redirection
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // 4xx - Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 5xx - Server Errors
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    INSUFFICIENT_STORAGE: 507,
};


export const imageFolders = [
    "users",
    "riders",
    "rider-documents",
    "restaurants",
    "restaurant-documents",
    "foodItems",
    "martstore-documents",
    "martstore-products"
] as const;



export type ImageFolder = (typeof imageFolders)[number];

// Mapping of which roles are allowed to upload to which folders
export const allowedFoldersByRole: Record<Role, ImageFolder[]> = {
    user: ["users"],
    rider: ["riders", "rider-documents"],
    restaurantAdmin: ["restaurants", "restaurant-documents", "foodItems"],
    superAdmin: [
        "users",
        "riders",
        "rider-documents",
        "restaurants",
        "restaurant-documents",
        "foodItems",
    ],
    martStoreAdmin: [
        "martstore-documents",
        'martstore-products'
    ]
};



// order constants 
export const CURRENCY: string = "INR";
export const GST: number = 5;
export const platformFee: number = 10;








