import { Header, Loader } from "@nudmcdgnpm/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StreetVendingApplication from "./StreetVendingApplication";

/**
 * SVMyApplications Component
This component is responsible for displaying the street vending applications submitted by the user.
It fetches the applications using a custom hook and send it as a props in StreetVendingApplication component so that component show the data in list format .
If there are no applications found, a message is displayed informing the user.
The component also provides a link to load more applications if available, 
and a link for the user to apply for a new street vending application.*/

export const SVMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().info;
  

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let filter1 =  { limit: "4", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId,createdby:user?.uuid };

  const { isLoading, data } = Digit.Hooks.sv.useSvSearchApplication({ filters: filter1 });

  const {SVDetail: applicationsList } = data || {};


  if (isLoading) {
    return <Loader />;
  }


  return (
    <React.Fragment>
      <Header>{`${t("SV_MY_APPLICATIONS")} ${applicationsList ? `(${applicationsList.length})` : ""}`}</Header>
      <div>
        {applicationsList?.length > 0 &&
          applicationsList.map((application, index) => (
            <div key={index}>
              <StreetVendingApplication application={application} tenantId={user?.permanentCity} buttonLabel={"TRACK"}/>
            </div>
          ))}
        {!applicationsList?.length > 0 && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("SV_NO_APPLICATION_FOUND_MSG")}</p>}

        {applicationsList?.length !== 0 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">{<Link to={`/digit-ui/citizen/sv/my-applications/${t1}`}>{t("SV_LOAD_MORE_MSG")}</Link>}</span>
            </p>
          </div>
        )}
      </div>

      <p style={{ marginLeft: "16px", marginTop: "16px" }}>
        {t("SV_NO_APPLICATION_FOUND")}{" "}
        <span className="link" style={{ display: "block" }}>
          <Link to="/digit-ui/citizen/sv/apply/info">{t("SV_CLICK_TO_APPLY_NEW_APPLICATION")}</Link>
        </span>
      </p>
    </React.Fragment>
  );
};
