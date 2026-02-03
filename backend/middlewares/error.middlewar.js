const errorMiddleware = (err, req, res, next) => {
    try {
        let error = {...err};
        error.message = err.message;
        console.log(err.name);
        //mongoose bad ObjectId
        if(err.name === 'CastError'){
            const message = `Resource not found with id of ${err.value}`;
            error = new Error(message);
            error.statusCode = 404;
        }
        //mongoose duplicate key
        if(err.code === 11000){
            const message = `Duplicate field value entered for ${Object.keys(err.keyValue)} field, please use another value`;
            error = new Error(message);
            error.statusCode = 400;
        }
        //mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = new Error(message);
            error.statusCode = 400;
        }
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    } catch (error) {
         console.error('Error in errorMiddleware:', error.message); // Log the error instead of calling next
        res.status(500).json({
            success: false,
            error: 'An unexpected error occurred in errorMiddleware',
        });
    }
};
export default errorMiddleware;
