import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/fileUpload.js'
import { apiResponse } from '../utils/apiResponse.js';

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

const generateAccessAndRefreshToken = async (user) => {
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
    const loggedInUser= User.findById(user._id).select("-password -refreshToken")
    
    const option ={
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
    .coookie("accessToken", accessToken, option)
    .coookie("refreshToken", refreshToken, option)
    .json(new apiResponse(200,{
        user:loggedInUser, accessToken, refreshToke
        }),
    "User logged in successfully!!")
})

export { registerUser, loginUser }