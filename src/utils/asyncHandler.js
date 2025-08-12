function asyncHandler(fun) {
  return async function (req, res, next) {
    try {
      await fun(req, res, next);
    } catch (error) {
     return res.status(error?.statusCode || 500).send({
        statusCode: error?.statusCode || 500,
        success: false,
        message: error?.message || "Inerval server error.",
      });
    }
  };
}

module.exports = { asyncHandler };