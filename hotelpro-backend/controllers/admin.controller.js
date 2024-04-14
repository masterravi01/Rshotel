const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError")
const { ApiResponse } = require("../utils/ApiResponse")


const apiTest = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, [], "Success message")
    )
})

module.exports = {
    apiTest
}