import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/fileUpload.js'
import { apiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"
const registerUser = asyncHandler(async (req, res) => {

    //get user details from frontend
    //validate-not empty
    //check if user already exists: username email
    //check for images, avatar
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const { fullName, email, username, password } = req.body;

    //validate-not empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required!")
    };

    //check if user already exists: username email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with username or email already exists!")
    }


    //check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "avatar file is required!")
    }

    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new apiError(400, "avatar uploading failed!!")
    }


    //create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if (!createdUser) {
        throw new apiError(500, "Register failed!")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registerd successfully!!")
    )

})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new apiError(500, error.message)
    }
}


const loginUser = asyncHandler(async (req, res) => {
    //req body - email password
    const { email, username, password } = req.body


    //username or email
    if (!(username || email)) {
        throw new apiError(400, "Username or email is required!")
    }

    //find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]

    })


    //check if user exists
    if (!user) {
        throw new apiError(404, "User not found!")
    }


    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiError(400, "Invalid password!")
    }


    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    // send cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new apiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User login successfully"))
})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                accessToken: undefined
            }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new apiResponse(200, "User logged out success!"))
})

const refreshAccessToken = asyncHandler(async (req, res,) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request!")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new apiError(401, "invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed"
            ))
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(401, "Invalid old password")
    }
    user.password = password
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new apiResponse(200, {}, "Password changed!"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new apiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccount = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || email) {
        throw new apiError(400, "all fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
        .json(new apiResponse(200, user, "account updated successfully!"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.files?.path

    if (!avatarPath) {
        throw new apiError(400, "Avatar is missing!!")
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    if (!avatar.url) {
        throw new apiError(400, "Upload failed!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(
        new apiResponse(200, user, " Avatar updated successfully!")
    )
})

const updateCover = asyncHandler(async (req, res) => {
    const coverPath = req.files?.path

    if (!coverPath) {
        throw new apiError(400, "Cover file is missing!!")
    }

    const cover = await uploadOnCloudinary(coverPath)
    if (!cover.url) {
        throw new apiError(400, "Upload failed!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: cover.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(
        new apiResponse(200, user, "Cover updated successfully!")
    )
})
export { 
    registerUser, 
    loginUser, 
    logOutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccount,
    updateAvatar,
    updateCover
} 