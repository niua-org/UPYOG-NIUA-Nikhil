import React, { useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@egovernments/digit-ui-react-components";
import Timeline from "../components/TLTimeline";

const PTRSelectProofIdentity = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);

  // const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
  

  const { isLoading, data } = Digit.Hooks.ptr.usePetMDMS(stateId, "PetService", "Documents");
  console.log("datatata",data)

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  // useEffect(() => {
  //   let count = 0;
  //   data?.PetService?.Documents.map((doc) => {
  //     console.log("gggggggggggggggggggggggggg",doc)
  //     let isRequired = false;
  //     documents.map((data) => {
  //       console.log("fffffffffffffffffffffffffffffffffffff",data)
  //       if (doc.required && data?.documentType.includes(doc.code)) isRequired = true;
  //     });
  //     if (!isRequired && doc.required) count = count + 1;
  //   });
  //   if ((count == "0" || count == 0) && documents.length > 0) setEnableSubmit(false);
  //   else setEnableSubmit(true);
  // }, [documents, checkRequiredFields]);

  const PTRDocument = data?.PetService?.Documents.map(document => ({
    ...document,
    hasDropdown: true
  }));

  // const goNext = () => {
  //   onSelect(config.key, { documents, PTRDocumentLength: PTRDocument?.length });
  // };

  
  // useEffect(() => {
  //   goNext();
  // }, [documents]);

  return (
    <div>
      {userType === "citizen" && <Timeline currentStep={4} />}
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={!enableSubmit} onAdd={onAdd}>
          {PTRDocument?.map((document, index) => {
            console.log("ooooooooooooooooooooooooooooooooooooooo",document)
            return (
              <PTRSelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
              />
            );
          })}
          {error && <Toast label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};


function PTRSelectDocument({
  t,
  document: doc,
  setDocuments,
  error,
  setError,
  documents,
  action,
  formData,
  setFormError,
  clearFormErrors,
  config,
  formState,
  fromRawData,
  id,
  propertyInitialValues,
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  ////console.log("ffffffff", filteredDocument);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: filteredDocument?.status === "ACTIVE", code: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );

  ////console.log("4444444444",selectedDocument);
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);
  ////console.log("7/////////////",handlePTRSelectDocument);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;
  //console.log("dshdfsgfhshfjshfjhsfhu",dropdownData)
  //const { dropdownFilter, enabledActions, filterCondition } = doc?.additionalDetails || {};
  var dropDownData = dropdownData;
   //let hideInput = false;
  const [isHidden, setHidden] = useState(false);

  // const addError = () => {
  //   let type = formState.errors?.[config.key]?.type;
  //   if (!Array.isArray(type)) type = [];
  //   if (!type.includes(doc.code)) {
  //     type.push(doc.code);
  //     setFormError(config.key, { type });
  //   }
  // };

  // const removeError = () => {
  //   let type = formState.errors?.[config.key]?.type;
  //   if (!Array.isArray(type)) type = [];
  //   if (type.includes(doc?.code)) {
  //     type = type.filter((e) => e != doc?.code);
  //     if (!type.length) {
  //       clearFormErrors(config.key);
  //     } else {
  //       setFormError(config.key, { type });
  //     }
  //   }
  // };

  useEffect(() => {
    if (selectedDocument?.code) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: selectedDocument?.code,
            filestoreId: uploadedFile,
            documentUid: uploadedFile,
          },
        ];
      });
    }
    // if (!isHidden) {
    //   if (!uploadedFile || !selectedDocument?.code) {
    //     addError();
    //   } else if (uploadedFile && selectedDocument?.code) {
    //     removeError();
    //   }
    // } else if (isHidden) {
    //   removeError();
    // }
  }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
      const docType = dropDownData
        .filter((e) => e.code === originalDoc?.documentType)
        .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
        //console.log("5555555555", docType);
      if (!docType) setHidden(true);
      else {
        setSelectedDocument(docType);
        setUploadedFile(originalDoc?.fileStoreId);
      }
    } else if (action === "create") {
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          // if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    if (isHidden) setUploadedFile(null);
  }, [isHidden]);

  return (
    <div style={{ marginBottom: "24px" }}>
      {doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + "  *"}</CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            // disable={dropDownData?.length === 0 || (propertyInitialValues?.documents && propertyInitialValues?.documents.length>0 && propertyInitialValues?.documents.filter((document) => document.documentType.includes(doc?.code)).length>0? enabledActions?.[action].disableDropdown : false)}
            option={dropDownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : null}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller"></CardLabel>
        <div className="field">
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            id={id}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".pdf, .jpeg, .jpg, .png"   //  to accept document of all kind
            // disabled={(propertyInitialValues?.documents && propertyInitialValues?.documents.length>0 && propertyInitialValues?.documents.filter((document) => document.documentType.includes(doc?.code)).length>0? enabledActions?.[action].disableUpload : false) || !selectedDocument?.code}
            buttonType="button"
            error={!uploadedFile}
          />
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default PTRSelectProofIdentity;



