exports.validateErrors = validationArr => {
  let error;

  for (let i = 0; i < validationArr.length; i += 1) {
    const { key, message } = validationArr[i];
    if (!key) {
      error = message;
      break;
    }
  }

  return error ? Promise.reject(new Error(error)) : 'Dependencies fulfilled';
};
