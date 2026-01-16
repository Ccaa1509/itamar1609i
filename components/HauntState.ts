
export const hauntState = {
  isGlitching: false,
  intensity: 0,
  // Scripted Event Flags
  triggerTvEvent: false,    // Set to true when TV is turned on after 20 mins
  tvEventFinished: false    // Set to true after the jumpscare happens, to prevent repeat
};
