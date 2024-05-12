"use server"
import { revalidatePath } from "next/cache"
import { handleError } from "../utils"
import { getConnection } from "../database/mongoose"
import User from "../database/models/user.model"
import Image from '../database/models/image.model'
import { redirect } from 'next/navigation';

import { v2 as cloudinary } from 'cloudinary'

// specified path in the document of one collection with the actual document from the other collection.
// basically replaces the author key with the user model
const populateUser = (query: any) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName clerkId'
})


// add image to database
export const addImage = async ({ image, userId, path }: AddImageParams) => {
    try {
        await getConnection()

        const author = await User.findById(userId)

        if (!author) {
            throw new Error("User not found")
        }

        revalidatePath(path) // clears cache so that it loads the image

        const newImage = await Image.create({
            ...image,
            author: author.id
        })

        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error)
    }
}

export const updateImage = async ({ image, userId, path }: UpdateImageParams) => {
    try {
        await getConnection()

        const imageToUpdate = await Image.findById(image._id)

        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized or image not found");
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            { new: true } // create new instance if does not exist
        )

        revalidatePath(path);

        return JSON.parse(JSON.stringify(updatedImage));
    } catch (error) {
        handleError(error)
    }
}

export async function deleteImage(imageId: string) {
    try {
        await getConnection();

        await Image.findByIdAndDelete(imageId);
    } catch (error) {
        handleError(error)
    } finally {
        redirect('/')
    }
}

// GET IMAGE
export async function getImageById(imageId: string) {
    try {
        await getConnection();

        // now image contains data about the user
        const image = await populateUser(Image.findById(imageId));

        if (!image) throw new Error("Image not found");

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        handleError(error)
    }
}

export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
    limit?: number;
    page: number;
    searchQuery?: string;
}) {
    try {
        await getConnection();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        })

        let expression = 'folder=envisage';

        if (searchQuery) {
            expression += ` AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search
            .expression(expression)
            .execute();

        const resourceIds = resources.map((resource: any) => resource.public_id);

        let query = {};

        if (searchQuery) {
            query = {
                publicId: {
                    $in: resourceIds
                }
            }
        }

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(Image.find(query))
            .sort({ updatedAt: -1 })
            .skip(skipAmount)
            .limit(limit);

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
            savedImages,
        }
    } catch (error) {
        handleError(error)
    }
}

// GET IMAGES BY USER
export async function getUserImages({
    limit = 9,
    page = 1,
    userId,
}: {
    limit?: number;
    page: number;
    userId: string;
}) {
    try {
        await getConnection();

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(Image.find({ author: userId }))
            .sort({ updatedAt: -1 })
            .skip(skipAmount)
            .limit(limit);

        const totalImages = await Image.find({ author: userId }).countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPages: Math.ceil(totalImages / limit),
        };
    } catch (error) {
        handleError(error);
    }
}