package com.epicure.platform.web;

import com.epicure.platform.application.CreativeRecipeService;
import com.epicure.platform.application.ModelQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class ApiValidationSecurityTest {

    @Test
    void invalidRequestBodiesDoNotExposeSpringOrApplicationInternals() throws Exception {
        MockMvc mvc = standaloneSetup(
                new ModelController(mock(ModelQueryService.class)),
                new CreativeRecipeController(mock(CreativeRecipeService.class))
        ).setControllerAdvice(new ApiExceptionHandler()).build();

        assertSafeValidationResponse(mvc, "/v1/models/core/slerp", """
                {"seed":"miso","direction":"cuisine:South_Asian","theta_deg":999,"k":0}
                """);
        assertSafeValidationResponse(mvc, "/v1/creative/recipe-ideas", """
                {"title":"My next dish","ingredients":[],"suggestionsPerStyle":5}
                """);
    }

    private void assertSafeValidationResponse(MockMvc mvc, String path, String body) throws Exception {
        mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Request validation failed."))
                .andExpect(content().string(not(containsString("com.epicure"))))
                .andExpect(content().string(not(containsString("DefaultMessageSourceResolvable"))))
                .andExpect(content().string(not(containsString("rejected value"))));
    }
}
