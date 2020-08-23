import React from "react";
import { storesContext } from "../contexts";

export const useStores = () => React.useContext(storesContext);
