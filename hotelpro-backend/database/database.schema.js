const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const {
  UserRolesEnum,
  UserLoginType,
  RoomStatusEnum,
  AvailableUserLoginType,
  AvailableUserRoles,
  AvailableChangeValueEnum,
  AvailableRoomStatus,
  USER_TEMPORARY_TOKEN_EXPIRY,
  AvailableReservationStatusEnum,
  AvailableVehicleTypeEnum,
  AvailableWeekDayEnum,
} = require("../constants");

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    firstName: String,
    lastName: String,
    dob: String,
    isLoginable: String,
    phone: String,
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    loginType: {
      type: String,
      enum: AvailableUserLoginType,
      default: UserLoginType.EMAIL_PASSWORD,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
userSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

module.exports.User = mongoose.model("User", userSchema);

const propertySchema = new Schema(
  {
    subscriptionId: String,
    propertyName: String,
    ownerId: String,
    vip: String,
  },
  { timestamps: true }
);
module.exports.Property = mongoose.model("Property", propertySchema);

const propertyUnitSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    propertyUnitName: String,
    propertyUnitLegalName: String,
    propertyUnitCode: String,
    propertyUnitType: String,
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    description: String,
    website: String,
    socialMediaLinks: [String],
    active: Boolean,
  },
  { timestamps: true }
);
module.exports.PropertyUnit = mongoose.model(
  "PropertyUnit",
  propertyUnitSchema
);

const propertyUnitSetupSchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    checkInTime: String,
    checkOutTime: String,
  },
  { timestamps: true }
);
module.exports.PropertyUnitSetup = mongoose.model(
  "PropertyUnitSetup",
  propertyUnitSetupSchema
);

const taxSetSchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    taxDetailIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "TaxDetail",
      },
    ],
    taxSetName: String,
    active: Boolean,
  },
  { timestamps: true }
);
module.exports.TaxSet = mongoose.model("TaxSet", taxSetSchema);

const taxDetailSchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    taxPercentage: Number,
    taxName: String,
  },
  { timestamps: true }
);
module.exports.TaxDetail = mongoose.model("TaxDetail", taxDetailSchema);

const roomTypeSchema = new Schema(
  {
    roomTypeName: String,
    roomTypeCategory: String,
    description: String,
    images: [String],
    active: Boolean,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    adultOccupancy: Number,
    childOccupancy: Number,
  },
  { timestamps: true }
);
module.exports.RoomType = mongoose.model("RoomType", roomTypeSchema);

const roomSchema = new Schema(
  {
    roomName: String,
    roomNumber: String,
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
    },
    roomStatus: String,
    roomCondition: String,
    dnd: Boolean,
  },
  { timestamps: true }
);
module.exports.Room = mongoose.model("Room", roomSchema);

const addressSchema = new Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    pinCode: String,
    location: String,
  },
  { timestamps: true }
);
module.exports.Address = mongoose.model("Address", addressSchema);

const contactSchema = new Schema(
  {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  { timestamps: true }
);
module.exports.Contact = mongoose.model("Contact", contactSchema);

const ratePlanSetupSchema = new Schema(
  {
    active: Boolean,
    isBaseRate: Boolean,
    ratePlanName: String,
    ratePlanShortName: String,
    ratePlanDescription: String,
    cancellationPolicyId: {
      type: Schema.Types.ObjectId,
      ref: "CancellationPolicy",
    },
    noShowPolicyId: {
      type: Schema.Types.ObjectId,
      ref: "NoShowPolicy",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    isRefundable: Boolean,
  },
  { timestamps: true }
);
module.exports.RatePlanSetup = mongoose.model(
  "RatePlanSetup",
  ratePlanSetupSchema
);

const ratePlanRoomTypeSchema = new Schema(
  {
    ratePlanSetupId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanSetup",
    },
    startDate: Date,
    endDate: Date,
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
    },
  },
  { timestamps: true }
);
module.exports.RatePlanRoomType = mongoose.model(
  "RatePlanRoomType",
  ratePlanRoomTypeSchema
);

const ratePlanRoomRateSchema = new Schema(
  {
    ratePlanRoomDetailId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanRoomType",
    },
    rateType: {
      type: String,
      enum: ["baseRate", "discountRate"],
    },
    baseRate: Number,
  },
  { timestamps: true }
);
module.exports.RatePlanRoomRate = mongoose.model(
  "RatePlanRoomRate",
  ratePlanRoomRateSchema
);

const ratePlanRoomDateRateSchema = new Schema(
  {
    ratePlanRoomDetailId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanRoomType",
    },
    ratePlanRoomRateId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanRoomRate",
    },
    baseRate: Number,
  },
  { timestamps: true }
);
module.exports.RatePlanRoomDateRate = mongoose.model(
  "RatePlanRoomDateRate",
  ratePlanRoomDateRateSchema
);

const yieldSchema = new Schema(
  {
    yieldName: String,
    active: Boolean,
    yieldDescription: String,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    ratePlanSetupId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanSetup",
    },
  },
  { timestamps: true }
);
module.exports.Yield = mongoose.model("Yield", yieldSchema);

const yieldRoomTypeSchema = new Schema(
  {
    yieldId: {
      type: Schema.Types.ObjectId,
      ref: "Yield",
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
    },
    startDate: Date,
    endDate: Date,
    occupancyRangeStart: Number,
    occupancyRangeEnd: Number,
    changeType: {
      type: String,
      enum: AvailableChangeValueEnum,
    },
    changeValue: Number,
  },
  { timestamps: true }
);
module.exports.YieldRoomType = mongoose.model(
  "YieldRoomType",
  yieldRoomTypeSchema
);

const noShowPolicySchema = new Schema(
  {
    noShowPolicyName: String,
    chargeType: {
      type: String,
      enum: AvailableChangeValueEnum,
    },
    chargeValue: Number,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    policyDescription: String,
  },
  { timestamps: true }
);
module.exports.NoShowPolicy = mongoose.model(
  "NoShowPolicy",
  noShowPolicySchema
);

const cancellationPolicySchema = new Schema(
  {
    cancelPolicyName: String,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    policyDescription: String,
    insideWindowRange: String,
    outsideWindowRange: String,
    insideWindowType: {
      type: String,
      enum: AvailableChangeValueEnum,
    },
    outsideWindowType: {
      type: String,
      enum: AvailableChangeValueEnum,
    },
    insideWindowCharge: Number,
    outsideWindowCharge: Number,
  },
  { timestamps: true }
);
module.exports.CancellationPolicy = mongoose.model(
  "CancellationPolicy",
  cancellationPolicySchema
);

const earlyCheckoutPolicySchema = new Schema(
  {
    earlyCheckoutPolicyName: String,
    chargeType: {
      type: String,
      enum: AvailableChangeValueEnum,
    },
    chargeValue: Number,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    policyDescription: String,
  },
  { timestamps: true }
);
module.exports.EarlyCheckoutPolicy = mongoose.model(
  "EarlyCheckoutPolicy",
  earlyCheckoutPolicySchema
);

const reservationDocumentSchema = new Schema(
  {
    documentType: String,
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    documentLink: String,
  },
  { timestamps: true }
);
module.exports.ReservationDocument = mongoose.model(
  "ReservationDocument",
  reservationDocumentSchema
);

const propertyDocumentSchema = new Schema(
  {
    documentType: String,
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    documentLink: String,
  },
  { timestamps: true }
);
module.exports.PropertyDocument = mongoose.model(
  "PropertyDocument",
  propertyDocumentSchema
);

const housekeepingTaskSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    taskName: String,
    taskDescription: String,
  },
  { timestamps: true }
);
module.exports.HousekeepingTask = mongoose.model(
  "HousekeepingTask",
  housekeepingTaskSchema
);

const housekeepingAssignSchema = new Schema(
  {
    housekeepingTaskId: {
      type: Schema.Types.ObjectId,
      ref: "HousekeepingTask",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    scheduleDate: Date,
    scheduleTime: String,
    status: String,
  },
  { timestamps: true }
);
module.exports.HousekeepingAssign = mongoose.model(
  "HousekeepingAssign",
  housekeepingAssignSchema
);

const bookingControlSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    date: Date,
    soldOut: Boolean,
  },
  { timestamps: true }
);
module.exports.BookingControl = mongoose.model(
  "BookingControl",
  bookingControlSchema
);

const roomMaintenanceSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    startDate: Date,
    endDate: Date,
    reason: String,
    description: String,
    status: {
      type: String,
      enum: AvailableRoomStatus,
      default: RoomStatusEnum.PENDING,
    },
  },
  { timestamps: true }
);
module.exports.RoomMaintenance = mongoose.model(
  "RoomMaintenance",
  roomMaintenanceSchema
);

const reservationSchema = new Schema(
  {
    roomIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    arrival: Date,
    departure: Date,
    reservationStatus: {
      type: String,
      enum: AvailableReservationStatusEnum,
    },
    notes: String,
    ratePlanSetupId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlanSetup",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports.Reservation = mongoose.model("Reservation", reservationSchema);

const reservationDetailSchema = new Schema(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    checkInDate: Date,
    checkOutDate: Date,
    noShowDate: Date,
    cancellationDate: Date,
    confirmationNumber: String,
    adults: Number,
    children: Number,
    checkInTime: Date,
    checkOutTime: Date,
  },
  { timestamps: true }
);
module.exports.ReservationDetail = mongoose.model(
  "ReservationDetail",
  reservationDetailSchema
);

const roomBalanceSchema = new Schema(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    balanceDate: Date,
    balance: Number,
    balanceName: String,
  },
  { timestamps: true }
);
module.exports.RoomBalance = mongoose.model("RoomBalance", roomBalanceSchema);

const shiftSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    shiftStartTime: Date,
    shiftEndTime: Date,
    day: {
      type: String,
      enum: AvailableWeekDayEnum,
    },
    active: Boolean,
  },
  { timestamps: true }
);
module.exports.Shift = mongoose.model("Shift", shiftSchema);

const vehicleSchema = new Schema(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    vehicleCompanyName: String,
    vehicleType: {
      type: String,
      enum: AvailableVehicleTypeEnum,
    },
    vehicleNumber: String,
    vehicleColor: String,
    vehicleDescription: String,
  },
  { timestamps: true }
);
module.exports.Vehicle = mongoose.model("Vehicle", vehicleSchema);

const hotelAmenitySchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    amenityName: String,
    amenityCharges: Number,
    amenityDescription: String,
  },
  { timestamps: true }
);
module.exports.HotelAmenity = mongoose.model(
  "HotelAmenity",
  hotelAmenitySchema
);

const roomAmenitySchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
    },
    amenityName: String,
    amenityCharges: Number,
    amenityDescription: String,
  },
  { timestamps: true }
);
module.exports.RoomAmenity = mongoose.model("RoomAmenity", roomAmenitySchema);

const notificationSchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: Boolean,
    message: String,
  },
  { timestamps: true }
);
module.exports.Notification = mongoose.model(
  "Notification",
  notificationSchema
);

const newDaySchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    ledgerDate: Date,
  },
  { timestamps: true }
);
module.exports.NewDay = mongoose.model("NewDay", newDaySchema);

const nightAuditSchema = new Schema(
  {
    propertyUnitId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyUnit",
    },
    date: Date,
    report: Object,
  },
  { timestamps: true }
);
module.exports.NightAudit = mongoose.model("NightAudit", nightAuditSchema);
