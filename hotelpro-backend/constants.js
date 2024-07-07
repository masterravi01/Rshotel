/**
 * @type {{ ADMIN: "admin"; CLIENT: "client"; FRONTDESK: "frontdesk"; HOUSEKEEPER: "housekeeper"; GUEST: "guest"; MANAGER: "manager"} as const}
 */
const UserRolesEnum = {
  ADMIN: "admin",
  CLIENT: "client",
  FRONTDESK: "frontdesk",
  HOUSEKEEPER: "housekeeper",
  GUEST: "guest",
  MANAGER: "manager",
};

module.exports.UserRolesEnum = UserRolesEnum;
module.exports.AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @type {{ PERCENTAGE: "percentage"; FLAT: "flat"} as const}
 */
const ChangeValueEnum = {
  PERCENTAGE: "percentage",
  FLAT: "flat",
};

module.exports.ChangeValueEnum = ChangeValueEnum;
module.exports.AvailableChangeValueEnum = Object.values(ChangeValueEnum);

/**
 * @type {{ PENDING: "pending"; COMPLETED: "completed" } as const}
 */
const RoomStatusEnum = {
  PENDING: "pending",
  COMPLETED: "completed",
};

module.exports.RoomStatusEnum = RoomStatusEnum;
module.exports.AvailableRoomStatus = Object.values(RoomStatusEnum);

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
 * @type {{ GOOGLE: "GOOGLE"; GITHUB: "GITHUB"; EMAIL_PASSWORD: "EMAIL_PASSWORD"} as const}
 */
const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

module.exports.UserLoginType = UserLoginType;
module.exports.AvailableUserLoginType = Object.values(UserLoginType);

/**
 * @type {{ RESERVED: "reserved"; INHOUSE: "inhouse"; CANCELLED: "cancelled"; NOSHOW: "noshow"; CHECKEDOUT: "checkedout"} as const}
 */
const ReservationStatusEnum = {
  RESERVED: "reserved",
  INHOUSE: "inhouse",
  CANCELLED: "cancelled",
  NOSHOW: "noshow",
  CHECKEDOUT: "checkedout",
};

module.exports.ReservationStatusEnum = ReservationStatusEnum;
module.exports.AvailableReservationStatusEnum = Object.values(
  ReservationStatusEnum
);

/**
 * @type {{ BIKE: "bike"; CAR: "car"; OTHER: "other" } as const}
 */
const VehicleTypeEnum = {
  BIKE: "bike",
  CAR: "car",
  OTHER: "other",
};

module.exports.VehicleTypeEnum = VehicleTypeEnum;
module.exports.AvailableVehicleTypeEnum = Object.values(VehicleTypeEnum);

/**
 * @type {{ MON: "mon"; TUE: "tue"; WED: "wed"; THU: "thu"; FRI: "fri"; SAT: "sat"; SUN: "sun"} as const}
 */
const WeekDayEnum = {
  MON: "mon",
  TUE: "tue",
  WED: "wed",
  THU: "thu",
  FRI: "fri",
  SAT: "sat",
  SUN: "sun",
};

module.exports.WeekDayEnum = WeekDayEnum;
module.exports.AvailableWeekDayEnum = Object.values(WeekDayEnum);

module.exports.USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
module.exports.MAXIMUM_SUB_IMAGE_COUNT = 4;
module.exports.MAXIMUM_SOCIAL_POST_IMAGE_COUNT = 6;
module.exports.DB_NAME = "hotelpro";
module.exports.paypalBaseUrl = {
  sandbox: "https://api-m.sandbox.paypal.com",
};
