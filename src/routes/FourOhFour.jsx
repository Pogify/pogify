import React from "react";
import { Layout } from "../layouts";
import { Link } from "react-router-dom";

export const FourOhFour = () => {
  return (
    <Layout>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>
          <div>404</div>
        </h1>
        <div>What you are looking for ain't here</div>
        <Link to="/">Go home</Link>
      </div>
    </Layout>
  );
};
