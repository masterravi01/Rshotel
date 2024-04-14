/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

module.exports.UserRolesEnum = UserRolesEnum;
module.exports.AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @type {{ PENDING: "PENDING"; CANCELLED: "CANCELLED"; DELIVERED: "DELIVERED" } as const}
 */
const OrderStatusEnum = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "DELIVERED",
};

module.exports.OrderStatusEnum = OrderStatusEnum;
module.exports.AvailableOrderStatuses = Object.values(OrderStatusEnum);

/**
 * @type {{ UNKNOWN:"UNKNOWN"; RAZORPAY: "RAZORPAY"; PAYPAL: "PAYPAL"; } as const}
 */
const PaymentProviderEnum = {
  UNKNOWN: "UNKNOWN",
  RAZORPAY: "RAZORPAY",
  PAYPAL: "PAYPAL",
};

module.exports.PaymentProviderEnum = PaymentProviderEnum;
module.exports.AvailablePaymentProviders = Object.values(PaymentProviderEnum);

/**
 * @type {{ FLAT:"FLAT"; } as const}
 */
const CouponTypeEnum = {
  FLAT: "FLAT",
  // PERCENTAGE: "PERCENTAGE",
};

module.exports.CouponTypeEnum = CouponTypeEnum;
module.exports.AvailableCouponTypes = Object.values(CouponTypeEnum);


/**
 * @type {{ GOOGLE: "GOOGLE"; GITHUB: "GITHUB"; EMAIL_PASSWORD: "EMAIL_PASSWORD"} as const}
 */
const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

module.exports.UserLoginType = UserLoginType;
module.exports.AvailableSocialLogins = Object.values(UserLoginType);

module.exports.USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
module.exports.MAXIMUM_SUB_IMAGE_COUNT = 4;
module.exports.MAXIMUM_SOCIAL_POST_IMAGE_COUNT = 6;
module.exports.DB_NAME = "hotelpro";
module.exports.paypalBaseUrl = {
  sandbox: "https://api-m.sandbox.paypal.com",
};

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
  // ? when message is deleted
  MESSAGE_DELETE_EVENT: "messageDeleted",
});

module.exports.ChatEventEnum = ChatEventEnum;
module.exports.AvailableChatEvents = Object.values(ChatEventEnum);

// module.exports = {
//   UserRolesEnum,
//   AvailableUserRoles,
//   OrderStatusEnum,
//   AvailableOrderStatuses,
//   PaymentProviderEnum,
//   AvailablePaymentProviders,
//   CouponTypeEnum,
//   AvailableCouponTypes,
//   UserLoginType,
//   AvailableSocialLogins,
//   YouTubeFilterEnum,
//   AvailableYouTubeFilters,
//   USER_TEMPORARY_TOKEN_EXPIRY,
//   MAXIMUM_SUB_IMAGE_COUNT,
//   MAXIMUM_SOCIAL_POST_IMAGE_COUNT,
//   DB_NAME,
//   paypalBaseUrl,
//   ChatEventEnum,
//   AvailableChatEvents,
// };