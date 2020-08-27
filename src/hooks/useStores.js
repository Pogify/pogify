import React from "react";
import { storesContext } from "../contexts";

// hook to access stores context
export const useStores = () => React.useContext(storesContext);
