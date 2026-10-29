import React from "react";
import { registerRoot } from "remotion";
import { StickDoors16x9Root } from "./index";
// Standalone entry so this film renders even while another project breaks the main bundle.
registerRoot(() => <StickDoors16x9Root />);
