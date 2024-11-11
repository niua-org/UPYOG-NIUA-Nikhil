package org.upyog.sv.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.upyog.sv.config.StreetVendingConfiguration;
import org.upyog.sv.repository.ServiceRequestRepository;
import org.upyog.sv.web.models.StreetVendingRequest;
import org.upyog.sv.web.models.transaction.Transaction;
import org.upyog.sv.web.models.transaction.TransactionRequest;
import org.upyog.sv.web.models.workflow.ProcessInstance;
import org.upyog.sv.web.models.workflow.ProcessInstanceRequest;
import org.upyog.sv.web.models.workflow.ProcessInstanceResponse;
import org.upyog.sv.web.models.workflow.State;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import digit.models.coremodels.PaymentRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PaymentNotificationService {

	@Autowired
	private ObjectMapper mapper;

	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsUrl;

	@Autowired
	private StreetVendingConfiguration configs;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private StreetVendingService bookingService;

	/**
	 *
	 * @param record
	 * @param topic
	 */

	public void process(HashMap<String, Object> record, String topic) throws JsonProcessingException {
		log.info(" Receipt consumer class entry " + record.toString());
		try {
			PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
			log.info("paymentRequest : " + paymentRequest);
			String businessService = paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService();
			log.info("Payment request processing in CHB method for businessService : " + businessService);
			if (configs.getBusinessServiceName()
					.equals(paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService())) {
				String bookingNo = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
				log.info("Updating payment status for CHB booking : " + bookingNo);
				
			}
		} catch (IllegalArgumentException e) {
			log.error("Illegal argument exception occured while sending notification Street Vending : " + e.getMessage());
		} catch (Exception e) {
			log.error("An unexpected exception occurred while sending notification Street Vending : ", e);
		}

	}

	public void updateWorkflowStatus(PaymentRequest paymentRequest) {

		ProcessInstance processInstance = getProcessInstanceForCHB(paymentRequest);
		log.info(" Process instance of chb application " + processInstance.toString());
		ProcessInstanceRequest workflowRequest = new ProcessInstanceRequest(paymentRequest.getRequestInfo(),
				Collections.singletonList(processInstance));
		callWorkFlow(workflowRequest);

	}

	private ProcessInstance getProcessInstanceForCHB(PaymentRequest paymentRequest) {

		ProcessInstance processInstance = new ProcessInstance();
		processInstance
				.setBusinessId(paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode());
		processInstance.setAction("PAY");
		processInstance.setModuleName(configs.getModuleName());
		processInstance.setTenantId(paymentRequest.getPayment().getTenantId());
		processInstance.setBusinessService(configs.getBusinessServiceName());
		processInstance.setDocuments(null);
		processInstance.setComment(null);
		processInstance.setAssignes(null);

		return processInstance;

	}

	public State callWorkFlow(ProcessInstanceRequest workflowReq) {
		log.info(" Workflow Request for CHB service for final step " + workflowReq.toString());
		ProcessInstanceResponse response = null;
		StringBuilder url = new StringBuilder(configs.getWfHost().concat(configs.getWfTransitionPath()));
		log.info(" URL for calling workflow service " + workflowReq.toString());
		Object workflow = serviceRequestRepository.fetchResult(url, workflowReq);
		response = mapper.convertValue(workflow, ProcessInstanceResponse.class);
		return response.getProcessInstances().get(0).getState();
	}

	public void processTransaction(HashMap<String, Object> record, String topic,
			  String status){
			  
			  TransactionRequest transactionRequest = mapper.convertValue(record,
			  TransactionRequest.class);
			  
			  RequestInfo requestInfo = transactionRequest.getRequestInfo(); Transaction
			  transaction = transactionRequest.getTransaction();
			  
			  log.info("Transaction in process transaction : " + transaction);
			  
			  Transaction.TxnStatusEnum transactionStatus = transaction.getTxnStatus();
			  String bookingNo = transaction.getConsumerCode();
			  
			  String moduleName = transaction.getModule();
			  
			  //Payment failure status JSON does not contain module name so added this condition
				if (null == moduleName && null != bookingNo) { // Update module name from consumer code
					moduleName = bookingNo.startsWith("CHB") ? configs.getBusinessServiceName() : null;
				}
			  
			  
			  log.info("moduleName : " + moduleName + "  transactionStatus  : " +
			  transactionStatus);
			  
			  /*if(configs.getBusinessServiceName() .equals(moduleName) &&
			  (Transaction.TxnStatusEnum.FAILURE.equals(transactionStatus) ||
			  Transaction.TxnStatusEnum.PENDING.equals(transactionStatus))){
			  
			  if(Transaction.TxnStatusEnum.FAILURE.equals(transactionStatus)){ 
				  status = BookingStatusEnum.PAYMENT_FAILED; 
				  } 
			  log.info("For booking no : " + bookingNo + " transaction id : " + transaction.getTxnId());
			  
			  CommunityHallBookingDetail bookingDetail =
			  CommunityHallBookingDetail.builder().bookingNo(bookingNo) .build();
			  CommunityHallBookingRequest bookingRequest =
			  CommunityHallBookingRequest.builder()
			  .requestInfo(requestInfo).hallsBookingApplication(bookingDetail).build();
			  bookingService.updateBooking(bookingRequest, null, status);
			  
			  } */
			  }

}
