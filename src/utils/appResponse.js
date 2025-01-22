export function AppResponse(
  res,
  statusCode,
  data,
  message
) {
  res.status(statusCode).json({
    status: "success",
    message: message ?? "Success",
    data: data ?? null,
  });
}