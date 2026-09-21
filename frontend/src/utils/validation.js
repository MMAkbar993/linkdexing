// Shared form validation rules.

// Same email pattern the backend uses (user.entity.js), minus the redundant
// escapes that tripped ESLint's no-useless-escape.
export const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PASSWORD_MIN = 5;
export const NAME_MIN = 4;
