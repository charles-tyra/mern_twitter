import jwtFetch from './jwt';

const RECEIVE_CURRENT_USER = 'session/RECEIVE_CURRENT_USER';
const RECEIVE_SESSION_ERRORS = 'session/RECEIVE_SESSION_ERRORS';
const CLEAR_SESSION_ERRORS = 'session/CLEAR_SESSION_ERRORS';
export const RECEIVE_USER_LOGOUT = 'session/RECEIVE_USER_LOGOUT';

const receieveCurrentUser = currentUser => ({
   type: RECEIVE_CURRENT_USER,
   currentUser
});

const receiveErrors = errors => ({
   type: RECEIVE_SESSION_ERRORS,
   errors
});

const logoutUser = () => ({
   type: RECEIVE_USER_LOGOUT
});

export const clearSessionErrors = () => ({
   type: CLEAR_SESSION_ERRORS
});

export const signup = user => startSession(user, 'api/users/register');
export const login = user => startSession(user, 'api/users/login');

const startSession = (userInfo, route) => async dispatch => {
   try {
      const res = await jwtFetch(route, {
         method: "POST",
         body: JSON.stringify(userInfo)
      });
      const { user, token } = await res.json();
      localStorage.setItem('jwtToken', token);
      return dispatch(receieveCurrentUser(user));
   } catch(err) {
      const res = await err.json();
      if (res.statusCode === 400) {
         return dispatch(receiveErrors(res.errors));
      }
   }
};

export const logout = () => dispatch => {
   localStorage.removeItem('jwtToken');
   dispatch(logoutUser());
}

export const getCurrentUser = () => async dispatch => {
   const res = await jwtFetch('/api/users/current');
   const user = await res.json();

   return dispatch(receieveCurrentUser(user));
}

const nullErrors = null;

export const sessionErrorsReducer = (state = nullErrors, action) => {
   switch(action.type) {
      case RECEIVE_SESSION_ERRORS:
         return action.errors;
      case RECEIVE_CURRENT_USER:
      case CLEAR_SESSION_ERRORS:
         return nullErrors;
      default:
         return state;
   }
}

const intialState = {
   user: undefined
};

const sessionReducer = (state = intialState, action) => {
   switch(action.type) {
      case RECEIVE_CURRENT_USER:
         return { user: action.currentUser };
      case RECEIVE_USER_LOGOUT:
         return intialState;
      default:
         return state;
   }
};

export default sessionReducer;