import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { PlusCircleOutlined, ShareAltOutlined } from "@ant-design/icons";
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { DealList } from "./pages/deals/list";
import { PendingDealList } from "./pages/pending-deals/list";
import { TroubleshootingPage } from "./pages/troubleshooting";
import { ManualDealCreate } from "./pages/manual-deal/create";
import { SocialMediaPage } from "./pages/social-media";
import { CustomTitle } from "./components/CustomTitle";
import { Login } from "./pages/login";
import { authProvider } from "./providers/auth";
import { apiDataProvider } from "./providers/apiDataProvider";

function App() {
  return (
    <HashRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
              <Refine
                dataProvider={apiDataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "deals",
                    list: "/deals",
                    meta: { label: "Active Deals" }
                  },
                  {
                    name: "pending-deals",
                    list: "/pending-deals",
                    meta: { label: "Pending Deals" }
                  },
                  {
                    name: "manual-deal",
                    list: "/manual-deal/create",
                    meta: {
                      label: "Add Manual Deal",
                      icon: <PlusCircleOutlined />
                    }
                  },
                  {
                    name: "troubleshooting",
                    list: "/troubleshooting",
                    meta: { label: "Troubleshooting" }
                  },
                  {
                    name: "social-media",
                    list: "/social-media",
                    meta: {
                      label: "Social Media",
                      icon: <ShareAltOutlined />
                    }
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "qNfIED-DbGnAi-jnB40M",
                }}
              >
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected admin routes */}
                  <Route
                    element={
                      <Authenticated key="authenticated-routes" fallback={<Login />}>
                        <ThemedLayout Title={CustomTitle}>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<NavigateToResource resource="pending-deals" />} />
                    <Route path="deals">
                      <Route index element={<DealList />} />
                    </Route>
                    <Route path="pending-deals">
                      <Route index element={<PendingDealList />} />
                    </Route>
                    <Route path="troubleshooting">
                      <Route index element={<TroubleshootingPage />} />
                    </Route>
                    <Route path="manual-deal/create" element={<ManualDealCreate />} />
                    <Route path="social-media">
                      <Route index element={<SocialMediaPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler handler={() => "Hunt Deals Admin Dashboard"} />
              </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </HashRouter>
  );
}

export default App;
