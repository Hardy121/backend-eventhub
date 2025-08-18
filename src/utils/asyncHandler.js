function asyncHandler(fun) {
  return async function (req, res, next) {
    try {
      await fun(req, res, next);
    } catch (error) {
      console.log(error)
      return res.status(error?.statusCode || 500).send({
        statusCode: error?.statusCode || 500,
        success: false,
        message: error,
      });
    }
  };
}

module.exports = { asyncHandler };