export const APIConstant = {
  LOGIN: 'user/login',
  FORGOT_PASSWORD: 'user/forget-password',
  LOGOUT: 'user/logout',
  REFRESH_TOKEN: 'user/refresh-token',
  GET_USER: 'user/current-user',
  CHANGE_PASSWORD: 'user/change-password',
  RESET_PASSWORD: 'user/reset-password/', //reset-password/:resetToken
  REGISTER_USER: 'user/register',

  CREATE_PROPERTY: 'property/create-property',
  UPLOAD_PROFILE_PHOTO: 'property/upload-profile-photo',
  UPLOAD_ROOMS_PHOTOS: 'property/upload-rooms-photos',
  UPDATE_PROPERTY_UNIT: 'propertyunit/update-propertyunit/',
  CREATE_PROPERTY_UNIT: 'propertyunit/create-propertyunit',
  READ_PROPERTY_UNIT: 'propertyunit/read-propertyunit/',

  READ_ROOMTYPES: 'room/read-roomtypes/',
  READ_ROOMTYPE_BY_ID: 'room/read-roomtypebyid/',
  ADD_ROOMTYPES: 'room/add-roomtype/',
  UPDATE_ROOM_TYPE: 'room/update-roomtype/',
  CREATE_ROOMTYPE_AND_ROOMS: 'room/create-roomtype-and-rooms/',
  READ_ROOMTYPE_AND_ROOMS: 'room/read-roomtype-and-rooms/',

  CREATE_ROOM: 'room/create-room',
  UPDATE_ROOM: 'room/update-room/',
  DELETE_ROOM: 'room/delete-room/',
};
