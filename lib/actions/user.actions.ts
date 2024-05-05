"use server"

// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#client-components
// alternative to api routes

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { getConnection } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
    try {
        await getConnection();

        const newUser = await User.create(user);

        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        handleError(error);
    }
}

// READ
export async function getUserById(userId: string) {
    try {
        await getConnection();

        const user = await User.findOne({ clerkId: userId });

        if (!user) throw new Error("User not found");

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        handleError(error);
    }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        await getConnection();

        const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
            new: true,
        });

        if (!updatedUser) throw new Error("User update failed");

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error);
    }
}

// DELETE
export async function deleteUser(clerkId: string) {
    try {
        await getConnection();

        // Find user to delete
        const userToDelete = await User.findOne({ clerkId });

        if (!userToDelete) {
            throw new Error("User not found");
        }

        // Delete user
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        revalidatePath("/");

        return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
        handleError(error);
    }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
    try {
        await getConnection();

        const updatedUserCredits = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { creditBalance: creditFee } },
            { new: true }
        )

        if (!updatedUserCredits) throw new Error("User credits update failed");

        return JSON.parse(JSON.stringify(updatedUserCredits));
    } catch (error) {
        handleError(error);
    }
}