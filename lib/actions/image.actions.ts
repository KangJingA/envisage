"use server"
import { revalidatePath } from "next/cache"
import { handleError } from "../utils"
import { getConnection } from "../database/mongoose"
import User from "../database/models/user.model"
import Image from '../database/models/image.model'
import { auth } from "@clerk/nextjs/server"
import { redirect } from 'next/navigation';

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