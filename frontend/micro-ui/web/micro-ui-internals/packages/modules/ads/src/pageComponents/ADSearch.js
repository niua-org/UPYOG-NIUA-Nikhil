import React, { useRef, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import {
  FormStep,
  CardHeader,
  CardLabel,
  Dropdown,
  SubmitBar,
  Toast,
  Card,
  RadioButtons,
  TextInput,
} from "@upyog/digit-ui-react-components";

/**
 * ADSSearch component handles the advertisement search functionality, 
 * allowing users to select advertisement types, locations, dates, 
 * and other criteria. It displays search results in a table format, 
 * supports adding items to a cart, and manages the overall form state 
 * for further processing based on user actions.
 */

import ADSCartDetails from "../components/ADSCartDetails";
const ADSSearch = ({ t, onSelect, config, userType, formData }) => {
  const { pathname: url } = useLocation();
  const user = Digit.UserService.getUser().info;
  let index = 0;
  const [cartDetails, setCartDetails] = useState(
    (formData.adslist && formData.adslist[index] && formData.adslist[index].cartDetails) || formData?.adslist?.cartDetails || []
  );
  const [adsType, setAdsType] = useState("" || formData?.adType);
  const [selectedLocation, setSelectedLocation] = useState("" || formData?.location);
  const [selectedFace, setSelectedFace] = useState("" || formData?.faceArea);
  const [fromDate, setFromDate] = useState("" || formData?.fromDate);
  // State to manage selected checkboxes
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [toDate, setToDate] = useState("" || formData?.toDate);
  const [Searchdata, setSearchData] = useState(
    (formData.adslist && formData.adslist[index] && formData.adslist[index].Searchdata) || formData?.adslist?.Searchdata || []
  );
  const [showToast, setShowToast] = useState(null);

  // If no nightLight is provided), default to "Yes"
  const [selectNight, setselectNight] = useState("" || formData?.nightLight || {
    i18nKey: "Yes",
    code: "Yes",
    value: "true",
  });
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const [showCartDetails, setShowCartDetails] = useState(false);
  let ADSTypeData = [];
  let LocationData = [];
  let FaceId = [];
  const { data: AdType } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "Advertisement", [{ name: "AdType" }], {
    select: (data) => {
      const formattedData = data?.["Advertisement"]?.["AdType"].map((details) => {
        return { i18nKey: `${details.name}`, code: `${details.code}`, name: `${details.name}`, active: `${details.active}` };
      });
      return formattedData;
    },
  });
  const { data: LocationDetails } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "Advertisement", [{ name: "Location" }], {
    select: (data) => {
      const formattedData = data?.["Advertisement"]?.["Location"].map((details) => {
        return { i18nKey: `${details.name}`, code: `${details.code}`, name: `${details.name}`, active: `${details.active}` };
      });
      return formattedData;
    },
  });
  const { data: Face } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "Advertisement", [{ name: "FaceArea" }], {
    select: (data) => {
      const formattedData = data?.["Advertisement"]?.["FaceArea"].map((details) => {
        return { i18nKey: `${details.name}`, code: `${details.code}`, name: `${details.name}`, active: `${details.active}` };
      });
      return formattedData;
    },
  });

  const { data: CalculationTypeData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "Advertisement", [{ name: "CalculationType" }],
    {
      select: (data) => {
        const formattedData = data?.["Advertisement"]?.["CalculationType"];
        return formattedData;
      },
  });


  AdType &&
    AdType.map((slot) => {
      ADSTypeData.push({ i18nKey: `${slot.name}`, code: `${slot.code}`, value: `${slot.name}` });
    });
  LocationDetails &&
    LocationDetails.map((slot) => {
      LocationData.push({ i18nKey: `${slot.name}`, code: `${slot.code}`, value: `${slot.name}` });
    });
  Face &&
    Face.map((slot) => {
      FaceId.push({ i18nKey: `${slot.name}`, code: `${slot.code}`, value: `${slot.name}` });
    });


    const mutation = Digit.Hooks.ads.useADSSlotSearch();
    let formdata = {
      advertisementSlotSearchCriteria: {
        bookingId:null,
        addType: Searchdata.addType,
        bookingStartDate: Searchdata.bookingStartDate,
        bookingEndDate:Searchdata.bookingEndDate,
        faceArea:Searchdata.faceArea,
        tenantId: tenantId,
        location:Searchdata.location,
        nightLight:Searchdata.nightLight,
        isTimerRequired: false
      }
    };
    
  useEffect(() => {
    if (mutation.data && mutation.data?.advertisementSlotAvailabiltityDetails) {
      const newData = mutation.data?.advertisementSlotAvailabiltityDetails.map((slot, index) => ({
        slotId: index + 1,
        addType: `${t(slot.addType)}`,
        addTypeCode:slot.addType,
        faceAreaCode:slot.faceArea,
        faceArea:`${t(slot.faceArea)}`,
        locationCode:slot.location,
        location: `${t(slot.location)}`,
        nightLight: slot.nightLight===false?"No":"Yes",
        bookingDate: slot.bookingDate,
        price:Searchdata.unitPrice,
        status: slot.slotStaus === "AVAILABLE" ? <div className="sla-cell-success">Available</div> : <div className="sla-cell-error">Booked</div>,
      }));
      // Only update state if newData is different from current state
      setData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
      setShowTable((prevShowTable) => {
        if (!prevShowTable) {
          return true;
        }
        return prevShowTable;
      });
    }
  }, [mutation.data, Searchdata]);
  
  const [data, setData] = useState("");
 const [showTable, setShowTable] = useState(false); // State to control table visibility
  const columns = [
    { Header: `${t("ADS_TYPE")}`, accessor: "addType" },
    { Header: `${t("ADS_FACE_AREA")}`, accessor: "faceArea" },
    { Header: `${t("ADS_NIGHT_LIGHT")}`, accessor: "nightLight" },
    { Header: `${t("ADS_DATE")}`, accessor: "bookingDate" },
    { Header: `${t("ADS_STATUS")}`, accessor: "status" },
  ];
  const { control } = useForm();
  const goNext = () => {
    let owner = formData.adslist && formData.adslist[index];
    let ownerStep;
    if (userType === "citizen") {
      ownerStep = { ...owner, cartDetails, adsType, selectedLocation,selectedFace,selectNight,fromDate,toDate };
      onSelect(config.key, { ...formData[config.key], ...ownerStep }, false, index);
    } else {
      ownerStep = { ...owner, cartDetails, adsType,selectNight,selectedLocation,selectedFace,fromDate,toDate };
      onSelect(config.key, ownerStep, false, index);
    }
    console.log("ownerStep",ownerStep);
  };
  const ABmenu = [
    {
      i18nKey: "Yes",
      code: "Yes",
      value: "true",
    },
    {
      i18nKey: "No",
      code: "No",
      value: "false",
    },
  ];
  function SetFromDate(e) {
    setFromDate(e.target.value);
  }

  function SetToDate(e) {
    setToDate(e.target.value);
  }

  const onSkip = () => onSelect();
  useEffect(() => {
    if (userType === "citizen") {
      goNext();
    }
  }, [cartDetails, adsType, selectNight,selectedFace,selectedLocation, Searchdata]);
 

// Handle row selection
const handleRowSelection = (rowIndex) => {
  const currentRowId = data[rowIndex].slotId;
  setSelectedCheckboxes((prevSelected) => {
    if (prevSelected.includes(currentRowId)) {
      return prevSelected.filter(id => id !== currentRowId);
    } else {
      return [...prevSelected, currentRowId];
    }
  });
};

// Checkbox column setup
const checkboxColumn = {
  id: "selection",
  Header: ({ getToggleAllRowsSelectedProps }) => (
    <div style={{ paddingLeft: "50px" }}>
      <input
        type="checkbox"
        checked={selectedCheckboxes.length === data.length}
        onChange={() => {
          if (selectedCheckboxes.length === data.length) {
            setSelectedCheckboxes([]);
          } else {
            const allAvailableRows = data
              .filter(row => row.status.props.children === "Available")
              .map(row => row.slotId);
            setSelectedCheckboxes(allAvailableRows);
          }
        }}
      />
    </div>
  ),
  Cell: ({ row }) => (
    <div style={{ paddingLeft: "50px" }}>
      <input
        type="checkbox"
        checked={selectedCheckboxes.includes(row.original.slotId)}
        onChange={() => handleRowSelection(row.index)}
        disabled={row.original.status.props.children !== "Available"}
      />
    </div>
  ),
};

const handleCartClick = () => {
  if (selectedCheckboxes.length === 0) {
    setShowToast({ error: true, label: t("ADS_SELECT_AT_LEAST_ONE_SLOT") });
  } else {
    // Get selected rows based on selectedCheckboxes
    const selectedRows = data.filter(row => selectedCheckboxes.includes(row.slotId));

    // Create a unique identifier for each row based on addType, faceArea, bookingDate, and location
    const newlyAddedRows = selectedRows.filter(selectedRow => 
      !cartDetails.some(cartRow => 
        cartRow.addType === selectedRow.addType &&
        cartRow.faceArea === selectedRow.faceArea &&
        cartRow.bookingDate === selectedRow.bookingDate &&
        cartRow.location === selectedRow.location
      )
    );

    if (newlyAddedRows.length > 0) {
      setCartDetails(prevCart => [...prevCart, ...newlyAddedRows]);
      setShowToast({ success: true, label: `${newlyAddedRows.length} item(s) added to cart.` });
    } else {
      setShowToast({ error: true, label: t("ADS_ITEM_ALREADY_IN_CART") });
    }

    // Clear selected checkboxes
    setSelectedCheckboxes([]);
  }
};
  const enhancedColumns = [checkboxColumn, ...columns];

  useEffect(() => {
    // Check if all required fields are filled
    if (
      formData?.adType &&
      formData?.faceArea &&
      formData?.fromDate &&
      formData?.toDate &&
      formData?.nightLight
    ) {
      const filters = {
        addType: formData?.adType?.code,
        faceArea: formData?.faceArea?.code,
        location: formData?.location?.code,
        nightLight: formData?.nightLight?.value,
        bookingStartDate: formData?.fromDate,
        bookingEndDate: formData?.toDate,
      };

      // Only update searchData if the filters have changed
      if (JSON.stringify(filters) !== JSON.stringify(Searchdata)) {
        setSearchData(filters);
      }
    }
  }, [formData]); // This will run whenever formData changes
  const handleSearch = () => {
    const addType = adsType?.code;
    const startDate = fromDate;
    const endDate = toDate;
    const faceArea=selectedFace?.code;
    const location=selectedLocation?.value;
    const nightLight=selectNight?.value;
    let unitPrice;
    const item = CalculationTypeData?.find((item) => item?.location === location);
    
    if (item) {
      const calculationTypeKey = `CalculationType_${faceArea}`;
      unitPrice = item?.[calculationTypeKey]?.[0]?.amount;
    }
    if (adsType && startDate && endDate && faceArea && location && nightLight) {
      const filters = {
        addType: addType,
        faceArea:faceArea,
        location:location,
        nightLight:nightLight,
        bookingStartDate: startDate,
        bookingEndDate: endDate,
        unitPrice: unitPrice,
      };
      setSearchData(filters);
    }
    else{
      setShowToast({ 
        error: true, 
        label: t("PLEASE_FILL_ALL_FIELDS_TO_SEARCH") 
      });
    }
  };

  const handleViewCart = () => {
    if (cartDetails.length > 0) {
      setShowCartDetails(true); // Show the cart details only if there are items
    } else {
      setShowToast({ error: true, label: t("ADS_NO_ITEMS_IN_CART") }); // Provide feedback if cart is empty
    }
  };
  
  const handleBookClick = () => {
    if (cartDetails.length === 0) {
      setShowToast({ error: true, label: t("ADS_SELECT_AT_LEAST_ONE_SLOT") });
    } else {
      goNext(); // Proceed to the next step
    }
  };
  
const handleCloseCart = () => {
    setShowCartDetails(false); // Close the cart details
};
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 1500); // Close toast after 1.5 seconds
      return () => clearTimeout(timer); // Clear timer on cleanup
    }
  }, [showToast]);
  useEffect(() => {
    if (Searchdata.addType) {
      mutation.mutate(formdata);
    }
  }, [Searchdata]);
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen")}
      <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t}>
        <CardHeader>{t("ADS_SEARCH_HEADER")}</CardHeader>
        <CardLabel>
          {`${t("ADS_TYPE")}`} <span className="check-page-link-button">*</span>
        </CardLabel>
          <Controller
            control={control}
            name={"adsType"}
            defaultValue={adsType}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={adsType}
                select={(selected) => {
                  setAdsType(selected);}}
                placeholder={"Select Advertisement Type"}
                option={ADSTypeData}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        <CardLabel>
          {`${t("ADS_LOCATION")}`} <span className="check-page-link-button">*</span>
        </CardLabel>
          <Controller
            control={control}
            name={"selectedLocation"}
            defaultValue={selectedLocation}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={selectedLocation}
                select={(selected) => {
                  setSelectedLocation(selected);
                }}
                placeholder={"Select Ad Type"}
                option={LocationData}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <CardLabel>
            {`${t("ADS_FACE_AREA")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
           <Controller
              control={control}
              name={"adsType"}
              defaultValue={selectedFace}
              rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  selected={selectedFace}
                  select={(selected) => {
                    setSelectedFace(selected);
                  }}
                  placeholder={"Select Ad Type"}
                  option={FaceId}
                  optionKey="i18nKey"
                  t={t}
                />
              )}
            />
            <CardLabel>{`${t("ADS_FROM_DATE")}`} <span className="astericColor">*</span></CardLabel>
            <TextInput
              t={t}
              type={"date"}
              isMandatory={false}
              optionKey="i18nKey"
              name="fromDate"
              value={fromDate}
              onChange={SetFromDate}
              style={{width:user.type==="EMPLOYEE"?"50%":"86%" }}
              min={new Date().toISOString().split('T')[0]}
              rules={{
                required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                validDate: (val) => (/^\d{4}-\d{2}-\d{2}$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
              }}

            />
            <CardLabel>{`${t("ADS_TO_DATE")}`} <span className="astericColor">*</span></CardLabel>
            <TextInput
              t={t}
              type={"date"}
              isMandatory={false}
              optionKey="i18nKey"
              name="toDate"
              value={toDate}
              onChange={SetToDate}
              style={{width:user.type==="EMPLOYEE"?"50%":"86%" }}
              min={new Date().toISOString().split('T')[0]}
              rules={{
                required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                validDate: (val) => (/^\d{4}-\d{2}-\d{2}$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
              }}

            />

        <CardLabel>
          {`${t("ADS_NIGHT_LIGHT")}`} <span className="astericColor">*</span>
        </CardLabel>
        <RadioButtons
          t={t}
          options={ABmenu}
          optionsKey="code"
          name="selectNight"
          value={selectNight}
          selectedOption={selectNight}
          innerStyles={{ display: "inline-block", marginLeft: "10px", paddingBottom: "2px", marginBottom: "2px" }}
          onSelect={setselectNight}
          isDependent={true}
        />
       <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
          <SubmitBar label={t("ES_COMMON_SEARCH")} onSubmit={handleSearch} />
          <SubmitBar label={t("ADS_ADD_TO_CART")} onSubmit={handleCartClick} />

          <div>
            <SubmitBar label={t("ADS_VIEW_CART")} onSubmit={handleViewCart} />
          </div>
          <div
            class="container"
            style={{
              width: "1px",
            }}
          >
            <div
              style={{
                width: "1px",
                position: "relative",
              }}
            >
              <div
               style={{
                position: "absolute", // or "relative" depending on parent element
                // fontSize: "335px",
                right: "83px", // Position it 0 from the right edge
                backgroundColor: "#FFFFFF",
                color: "#008000",
                padding: "4px",
                borderRadius: "30px",
                margin: "1px 0 1px 0",
                width: "31px",
                height: "30px",
                textAlign: "center",
                transform: "translateX(100%)", // Move left by 100% of its own width
              }}
              >
                <div> {cartDetails.length}</div>
              </div>
            </div>
          </div>

          {showCartDetails && <ADSCartDetails onClose={handleCloseCart} cartDetails={cartDetails} setCartDetails={setCartDetails} />}
          <SubmitBar label={t("ADS_BOOK_NOW")} onSubmit={handleBookClick} />
        </div>

      </FormStep>
      {showTable && ( // Only show table when showTable is true
        <Card>
          <ApplicationTable
            t={t}
            data={data}
            columns={enhancedColumns}
            getCellProps={(cellInfo) => ({
              style: {
                minWidth: "140px",
                padding: "20px",
                fontSize: "16px",
              },
            })}
            isPaginationRequired={false}
            totalRecords={data.length}
            style={{ width: "100%", overflowX: "auto" }} // Make table responsive
          />
        </Card>
      )}
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
    </React.Fragment>
  );
};
export default ADSSearch;