import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Content from "../pages/Content";
import CreateUser from "../pages/CreateUser";
import TokenReport from "../pages/TokenReport";
import ManageVehicle from "../pages/Vehicle_rate/Manage_vehicle";
import Loaded from "../pages/Loaded";
import ManageRate from "../pages/Vehicle_rate/Manage_rate";
import Token_list from "../pages/Token_Report/Token_list";
import Update_Token_list from "../pages/Token_Report/Update_Token_list";
import Delete_Token_list from "../pages/Token_Report/Delete_Token_list";
import Loaded_list from "../pages/Token_Report/Loaded_list";

const I_Routes = () => {
  return (
    <Routes>
      {[
        { path: "/", element: <Content /> },
        { path: "/create-user", element: <CreateUser /> },
        { path: "/token-report", element: <TokenReport /> },
        { path: "/vehicle-rate", element: <ManageVehicle /> },
        { path: "/loaded", element: <Loaded /> },
        { path: "/manage-rate", element: <ManageRate /> },
        { path: "/token-list", element: <Token_list /> },
        { path: "/update-token-list", element: <Update_Token_list /> },
        { path: "/delete-token-list", element: <Delete_Token_list /> },
        { path: "/loaded-list", element: <Loaded_list /> }
      ].map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requiredRole="admin">
              {element}
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};

export default I_Routes;
