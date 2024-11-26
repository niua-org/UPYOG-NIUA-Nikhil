package org.egov.applyworkflow.controller;

import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.egov.applyworkflow.model.WorkflowApplyRequest;
import org.egov.applyworkflow.service.WorkflowApplyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class WorkflowController {

    private final WorkflowApplyService workflowApplyService;

    public WorkflowController( WorkflowApplyService workflowApplyService) {
        this.workflowApplyService = workflowApplyService;
    }

    @PostMapping("/_process")
    @ApiOperation(value = "Process Workflow", notes = "Handles create or update workflow operations based on the payload")
    public ResponseEntity<String> processWorkflow(@ApiParam(value = "Workflow payload", required = true)
                                                  @Valid @RequestBody WorkflowApplyRequest payload) {
        log.info("Received workflow process request: {}", payload);

        String response = workflowApplyService.processWorkflow(payload);
        if (response == null || response.isEmpty()) {
            log.error("Workflow processing returned an empty response for payload: {}", payload);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Workflow processing failed. Empty response received.");
        }
        log.info("Workflow processed successfully");
        return ResponseEntity.ok(response);
    }
}
