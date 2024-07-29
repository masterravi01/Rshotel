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

  CREATE_TAX: 'propertyunit/create-tax',
  UPDATE_TAX: 'propertyunit/update-tax/',
  GET_TAX_BY_ID: 'propertyunit/get-tax-by-id/',
  DELETE_TAX: 'propertyunit/delete-tax/',
  GET_ALL_TAXES: 'propertyunit/get-all-taxes/',

  CREATE_NOSHOW_POLICY: 'ratemanagement/create-noshow-policy',
  UPDATE_NOSHOW_POLICY: 'ratemanagement/update-noshow-policy/',
  GET_NOSHOW_POLICY_BY_ID: 'ratemanagement/get-noshow-policy-by-id/',
  DELETE_NOSHOW_POLICY: 'ratemanagement/delete-noshow-policy/',
  GET_ALL_NOSHOW_POLICIES: 'ratemanagement/get-all-noshow-policies/',

  CREATE_CANCELLATION_POLICY: 'ratemanagement/create-cancellation-policy',
  UPDATE_CANCELLATION_POLICY: 'ratemanagement/update-cancellation-policy/',
  GET_CANCELLATION_POLICY_BY_ID:
    'ratemanagement/get-cancellation-policy-by-id/',
  DELETE_CANCELLATION_POLICY: 'ratemanagement/delete-cancellation-policy/',
  GET_ALL_CANCELLATION_POLICIES:
    'ratemanagement/get-all-cancellation-policies/',

  READ_RATEPLAN: 'ratemanagement/read-rateplan/',
  CREATE_RATEPLAN: 'ratemanagement/create-rateplan',
  UPDATE_RATEPLAN: 'ratemanagement/update-rateplan/',
};
