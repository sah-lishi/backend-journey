// export const asynchandler = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next)
// }
const asynchandler = (requestHandler) => {
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export{ asynchandler }

// const asynchandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
