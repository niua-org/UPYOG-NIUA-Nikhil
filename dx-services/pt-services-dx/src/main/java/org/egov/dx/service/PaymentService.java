package org.egov.dx.service;
import static org.egov.dx.util.PTServiceDXConstants.BUSINESSSERVICES_FIELD_FOR_SEARCH_URL;
import static org.egov.dx.util.PTServiceDXConstants.BUSINESSSERVICE_FIELD_FOR_FILESTORE_SEARCH_URL;
import static org.egov.dx.util.PTServiceDXConstants.CONSUMER_CODE_SEARCH_FIELD_NAME_PAYMENT;
import static org.egov.dx.util.PTServiceDXConstants.PROPERTY_TAX_SERVICE_CODE;
import static org.egov.dx.util.PTServiceDXConstants.RECEIPTNUMBER_FIELD_FOR_SEARCH_URL;
import static org.egov.dx.util.PTServiceDXConstants.SEPARATER;
import static org.egov.dx.util.PTServiceDXConstants.TENANT_ID_FIELD_FOR_SEARCH_URL;
import static org.egov.dx.util.PTServiceDXConstants.URL_PARAMS_SEPARATER;

import java.io.IOException;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.egov.dx.repository.Repository;
import org.egov.dx.util.Configurations;
import org.egov.dx.web.models.Payment;
import org.egov.dx.web.models.PaymentResponse;
import org.egov.dx.web.models.PaymentSearchCriteria;
import org.egov.dx.web.models.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PaymentService {

	@Autowired
	private Repository repository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private Configurations configurations;


	public List<Payment> getPayments(PaymentSearchCriteria criteria, String docType,RequestInfoWrapper requestInfoWrapper) {
		StringBuilder url = getPaymentSearchUrl(criteria,docType);
		return mapper.convertValue(repository.fetchResult(url, requestInfoWrapper), PaymentResponse.class).getPayments();
	}


	public StringBuilder getPaymentSearchUrl(PaymentSearchCriteria criteria, String docType) {
		String moduleName=getModule(docType);

		return new StringBuilder().append(configurations.getCollectionServiceHost())
				.append(configurations.getPaymentSearchEndpoint()).append(URL_PARAMS_SEPARATER)
				.append(TENANT_ID_FIELD_FOR_SEARCH_URL).append(criteria.getTenantId())
				.append(SEPARATER).append(CONSUMER_CODE_SEARCH_FIELD_NAME_PAYMENT)
				.append(StringUtils.join(criteria.getConsumerCodes(),","))
				.append(SEPARATER)
				.append(BUSINESSSERVICES_FIELD_FOR_SEARCH_URL)
				.append(moduleName);
	}
	
	public String getModule(String docType)
	{
		if(docType.equals("PRTAX"))
				return "PT";
		
		return "PT";
				
	}

	public Object getFilestore(RequestInfoWrapper requestInfoWrapper,
			 String fileStoreId) throws IOException {
		
		StringBuilder host=new StringBuilder().append(configurations.getFilestoreHost()).append(configurations.getFilstoreSearchEndpoint())
				.append(fileStoreId);

		return restTemplate.getForObject(host.toString(),Object.class);

	}


//	public StringBuilder getFilestoreSearchUrl(PaymentSearchCriteria criteria,String docType, String receiptNumber) {
//		String moduleName=getModule(docType);
//
//		return new StringBuilder().append(configurations.getPdfServiceHost())
//				.append(configurations.getPdfSearchEndpoint()).append(URL_PARAMS_SEPARATER)
//				.append(TENANT_ID_FIELD_FOR_SEARCH_URL).append(criteria.getTenantId())
//				.append(SEPARATER).append(RECEIPTNUMBER_FIELD_FOR_SEARCH_URL)
//				.append(receiptNumber)
//				.append(SEPARATER)
//				.append(BUSINESSSERVICE_FIELD_FOR_FILESTORE_SEARCH_URL)
//				.append(moduleName);
//	}


}
