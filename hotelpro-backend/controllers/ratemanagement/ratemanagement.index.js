import policyController from "./policy.controller.js";
import rateplanController from "./rateplan.controller.js";
import yieldController from "./yield.controller.js";

export default {
  ...policyController,
  ...rateplanController,
  ...yieldController,
};
