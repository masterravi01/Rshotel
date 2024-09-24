import reservationController from "./reservation.controller.js";
import noshowCancelController from "./noshow-cancel.controller.js";
import reservationInhouseController from "./reservation-inhouse.controller.js";
export default {
  ...reservationController,
  ...noshowCancelController,
  ...reservationInhouseController,
};
