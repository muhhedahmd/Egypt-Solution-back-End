import { ImageType } from "@prisma/client";
import { encode } from "blurhash";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";
import { UploadFileResult } from "uploadthing/types";
import prisma from "../config/prisma";
const utapi = new UTApi()

export async function generateBlurhash_with_size(buffer: Buffer): Promise<{
    blurHash: string,
    width: number,
    height: number
}> {
    const { data, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: "inside" })
        .toBuffer({ resolveWithObject: true });

    return {
        width: info.width,
        height: info.height,

        blurHash: encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
    };
}





export const UploadImage = async (logo: Buffer | null, name?: string) => {



    let logoUpload: {
        blurhash: string;
        width: number;
        height: number;
        data: UploadFileResult[];
    } | null = null;
    if (logo) {

        try {
            // Generate blur hash and get dimensions
            const buffer = Buffer.from(logo);
            const blurHashAndSize = await generateBlurhash_with_size(buffer);
            //   const arrayBuffer = await logo .buffer;

            // Create File object for UploadThing
            const logoBlob = new Blob([buffer], { type: "image/jpeg" });
            const logoFile = new File([logoBlob], name || "logo.jpg", { type: "image/jpeg" });

            // Upload to UploadThing
            const uploadResult = await utapi.uploadFiles([logoFile]);

            logoUpload = {
                blurhash: blurHashAndSize.blurHash,
                height: blurHashAndSize.height,
                width: blurHashAndSize.width,
                data: uploadResult,
            };

            return logoUpload
        } catch (uploadError) {
            console.error('Logo upload failed:', uploadError);
        }
    }

}




export const AssignImageToDBImage = async (data: {



    blurhash?: string;
    width?: number;
    height?: number;
    data?: UploadFileResult[];
    type: ImageType

} | undefined,
    txInstance?: typeof prisma

) => {
    if (!data) throw new Error("image Data error")
    const prismaTx = txInstance || prisma
    try {
        if (!data.data?.[0].data) throw new Error("error upload Image")
        else {
            if (!txInstance) {


                const imageUploaded = data.data?.[0].data
                const tx = await prisma.$transaction(async (tx) => {
                    try {
                        const image = await tx.image.create({
                            data: {
                                fileHash: imageUploaded.fileHash,
                                key: imageUploaded.key,
                                typeImage: imageUploaded.type,
                                alt: imageUploaded.name + "-alt",
                                customId: imageUploaded.customId,
                                filename: imageUploaded.name,
                                url: imageUploaded.ufsUrl,
                                blurHash: data.blurhash,
                                height: data.height,
                                width: data.width,
                                type: data.type,
                                size: imageUploaded.size
                            },
                            select: {
                                id: true,
                                type: true
                            }
                        })
                        return image

                    } catch (error) {

                        if (data.data?.[0].data?.key) utapi.deleteFiles(data.data?.[0].data.key)
                        console.log(error)
                        throw new Error("transiction Error")
                    }
                })

                return tx
            }
            else {
                

                if (!data.data?.[0].data) throw new Error("error upload Image")
                const imageUploaded = data.data?.[0].data

                try {
                    const image = await prismaTx.image.create({
                        data: {
                            fileHash: imageUploaded.fileHash,
                            key: imageUploaded.key,
                            typeImage: imageUploaded.type,
                            alt: imageUploaded.name + "-alt",
                            customId: imageUploaded.customId,
                            filename: imageUploaded.name,
                            url: imageUploaded.ufsUrl,
                            blurHash: data.blurhash,
                            height: data.height,
                            width: data.width,
                            type: data.type,
                            size: imageUploaded.size
                        },
                        select: {
                            id: true,
                            type: true
                        }
                    })
                    return image

                } catch (error) {
                    

                    if (data.data?.[0].data?.key) utapi.deleteFiles(data.data?.[0].data.key)
                    console.log(error)
                    throw new Error("transiction Error")
                }
            }
        }
    } catch (error) {
        console.log(error)
        throw new Error("error insert to db")


    }
}


