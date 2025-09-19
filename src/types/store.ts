import { ImageType } from "@prisma/client";
import { UploadFileResult } from "uploadthing/types";



export interface uploadStoreImage {

    blurhash: string;
    width: number;
    height: number;
    data: UploadFileResult[];

}
export interface storeSettingsReqInitlize {
    ownerId: string,
    storeName: string,
    storeDescription: string | null,
    allowGuestCheckout: boolean,
    requireEmailVerification: boolean,
    currency: string
    timezone: string

    metaTitle: string,
    metaDescription: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    logo: Buffer<ArrayBufferLike> | null,
}
export interface shapeOfRequestInitStore {

    banaer?: Buffer | null
    removeBanaer?: boolean | string,
    removeLogo?: boolean | string,
    ownerId: string;
    storeName: string;
    storeDescription: string | null;
    logo: Buffer<ArrayBufferLike> | null;
    banner?: Buffer | null;
    allowGuestCheckout: boolean;
    requireEmailVerification: boolean;
    currency: string;
    timezone: string;
    metaTitle: string | null;
    metaDescription: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    enableCOD: boolean
    enableChat: boolean
    enableComparisons: boolean
    enablePaypal: boolean
    enableReviews: boolean
    enableStripe: boolean
    enableWishlist: boolean
}

export interface image  {
    
    id: string;
    createdAt: Date;
    filename: string;
    url: string;
    alt: string | null;
    type: ImageType;
    size: number | null;
    width: number | null;
    height: number | null;
    blurHash: string | null;
    fileHash: string;
    key: string;
    typeImage: string;
    customId: string | null;
} 

export interface storeSettings {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    storeName: string;
    storeDescription: string | null;
    allowGuestCheckout: boolean;
    requireEmailVerification: boolean;
    currency: string;
    timezone: string;
    metaTitle: string | null;
    metaDescription: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    enableCOD: boolean
    enableChat: boolean
    enableComparisons: boolean
    enablePaypal: boolean
    enableReviews: boolean
    enableStripe: boolean
    enableWishlist: boolean
}