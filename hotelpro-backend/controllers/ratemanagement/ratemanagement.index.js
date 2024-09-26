import policyController from "./policy.controller.js";
import rateplanController from "./rateplan.controller.js";
import yieldController from "./yield.controller.js";
import availabilityController from "./availability.controller.js";

export default {
  ...policyController,
  ...rateplanController,
  ...yieldController,
  ...availabilityController
};
