// import { environment } from '../../environments/environment';

// const API = environment.apiBase.replace(/\/$/, '');   // trim trailing slash
// const HOST = API.replace(/\/api$/, '');               // drop trailing /api

// export const apiConstants = {
//   // bases
//   base_api: API,
//   base_host: HOST,

//   // auth & users
//   login_user_path:        `${API}/User/LoginUser`,
//   register_user_path:     `${API}/User/RegisterUser`,
//   get_all_users:          `${API}/User/GetAllUsers`,

//   // OTP / password
//   login_step1_path:       `${API}/User/LoginStep1`,
//   login_step2_path:       `${API}/User/LoginStep2`,
//   forgot_password_path:   `${API}/User/ForgotPassword`,
//   reset_password_path:    `${API}/User/ResetPassword`,
// };

import { environment } from '../../environments/environment';

const API  = environment.apiBase.replace(/\/$/, '');  // trim trailing slash
const HOST = API.replace(/\/api$/, '');               // drop trailing /api

export const apiConstants = {
  // bases
  base_api: API,
  base_host: HOST,

  // auth & users
  login_user_path:      `${API}/User/LoginUser`,
  register_user_path:   `${API}/User/RegisterUser`,
  get_all_users:        `${API}/User/GetAllUsers`,

  // OTP / password
  login_step1_path:     `${API}/User/LoginStep1`,
  login_step2_path:     `${API}/User/LoginStep2`,
  forgot_password_path: `${API}/User/ForgotPassword`,
  reset_password_path:  `${API}/User/ResetPassword`,
};
