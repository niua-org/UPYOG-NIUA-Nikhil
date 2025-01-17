import { Card, KeyNote, SubmitBar, Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

/*
 * AdsApplication component displays the details of a specific advertisement application.
 * It shows key information such as booking number, applicant name, advertisement name, 
 * booking dates, and application status. The component also includes functionality for 
 * making payments and navigating to the application details page.
 */

const AdsApplication = ({ application, tenantId, buttonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);

  const slotSearchData = Digit.Hooks.ads.useADSSlotSearch();
    let formdata = {
      advertisementSlotSearchCriteria: {
        bookingId:application?.bookingId,
        addType: application?.cartDetails?.[0]?.addType,
        bookingStartDate:application?.cartDetails?.[0]?.bookingDate,
        bookingEndDate: application?.cartDetails?.[application.cartDetails.length - 1]?.bookingDate,
        faceArea: application?.cartDetails?.[0]?.faceArea,
        tenantId: tenantId,
        location: application?.cartDetails?.[0]?.location,
        nightLight: application?.cartDetails?.[0]?.nightLight,
        isTimerRequired: true
      }
    };
   
  const getBookingDateRange = (bookingSlotDetails) => {
    if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
      return t("CS_NA");
    }
    const startDate = bookingSlotDetails[0]?.bookingDate;
    const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;
    if (startDate === endDate) {
      return startDate; // Return only the start date
    } else {
      // Format date range as needed, for example: "startDate - endDate"
      return startDate && endDate ? `${startDate}  -  ${endDate}` : t("CS_NA");
    }
  };

      const handleMakePayment = async () => {
        try {
          // Await the mutation and capture the result directly
          const result = await slotSearchData.mutateAsync(formdata);
          const isSlotBooked = result?.advertisementSlotAvailabiltityDetails?.some((slot) => slot.slotStaus === "BOOKED");
          const timerValue=result?.advertisementSlotAvailabiltityDetails[0].timerValue;
          if (isSlotBooked) {
            setShowToast({ error: true, label: t("ADS_ADVERTISEMENT_ALREADY_BOOKED") });
          } else {
            history.push({
              pathname: `/digit-ui/citizen/payment/my-bills/${"adv-services"}/${application?.bookingNo}`,
              state: { tenantId: application?.tenantId, bookingNo: application?.bookingNo, timerValue:timerValue },
            });
          }
      } catch (error) {
          console.error("Error making payment:", error);
      }
      };
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000); // Close toast after 2 seconds

      return () => clearTimeout(timer); // Clear timer on cleanup
    }
  }, [showToast]);
  return (
    <Card>
      <KeyNote keyValue={t("ADS_BOOKING_NO")} note={application?.bookingNo} />
      <KeyNote keyValue={t("ADS_APPLICANT_NAME")} note={application?.applicantDetail?.applicantName} />
      <KeyNote keyValue={t("ADS_BOOKING_DATE")} note={getBookingDateRange(application?.cartDetails)} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`${application?.bookingStatus}`)} />
      <div>
        <Link to={`/digit-ui/citizen/ads/application/${application?.bookingNo}/${application?.tenantId}`}>
          <SubmitBar label={buttonLabel} />
        </Link>
        {application.bookingStatus !== "BOOKED" && (
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handleMakePayment} style={{ margin: "20px" }} />
        )}
      </div>
      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </Card>
  );
};

export default AdsApplication;
