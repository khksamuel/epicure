package com.epicure.platform.infrastructure.model;

import com.epicure.platform.domain.model.ModelSibling;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;

class EpicureModelClientTest {

    private MockRestServiceServer server;
    private EpicureModelClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://model-service");
        server = MockRestServiceServer.bindTo(builder).build();
        client = new EpicureModelClient(builder.build());
    }

    @Test
    void preservesThePythonNeighborResponse() {
        server.expect(requestTo(
                        "http://model-service/v1/models/core/neighbors/miso?k=3&exclude_self=true"
                ))
                .andRespond(withSuccess("""
                        [{"ingredient":"mirin","score":0.7887070178985596}]
                        """, MediaType.APPLICATION_JSON));

        var result = client.neighbors(ModelSibling.CORE, "miso", 3, true);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().ingredient()).isEqualTo("mirin");
        assertThat(result.getFirst().score()).isEqualTo(0.7887070178985596);
        server.verify();
    }

    @Test
    void sendsSlerpThroughTheConfiguredRestClient() {
        server.expect(requestTo("http://model-service/v1/models/core/slerp"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("""
                        {
                          "seed": "rice",
                          "direction": "cuisine:South_Asian",
                          "theta_deg": 30.0,
                          "k": 5,
                          "exclude_seed": true
                        }
                        """))
                .andRespond(withSuccess("""
                        [{"ingredient":"cardamom","score":0.72}]
                        """, MediaType.APPLICATION_JSON));

        var result = client.slerp(
                ModelSibling.CORE, "rice", "cuisine:South_Asian", 30, 5, true
        );

        assertThat(result).extracting(item -> item.ingredient()).containsExactly("cardamom");
        server.verify();
    }

    @Test
    void supportsTheRemainingModelServiceOperations() {
        server.expect(requestTo("http://model-service/health"))
                .andRespond(withSuccess("{\"status\":\"ok\",\"models\":{}}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models"))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models/cooc/ingredients?query=app&limit=2"))
                .andRespond(withSuccess("[\"apple\"]", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models/chem/modes/closest/apple?kind=factor&k=2"))
                .andRespond(withSuccess("[{\"mode_id\":\"F_0/M1\",\"label\":\"Fruit\",\"score\":0.9}]", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models/core/modes?kind=binary"))
                .andRespond(withSuccess("[{\"mode_id\":\"food_group/M1\",\"label\":\"Aromatics\"}]", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models/core/modes/F_0%2FM1/members?k=1"))
                .andRespond(withSuccess("[\"apple\"]", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://model-service/v1/models/cooc/poles?prefix=taste:"))
                .andRespond(withSuccess("[\"taste:savoury\"]", MediaType.APPLICATION_JSON));

        assertThat(client.health().status()).isEqualTo("ok");
        assertThat(client.models()).isEmpty();
        assertThat(client.ingredients(ModelSibling.COOC, "app", 2)).containsExactly("apple");
        assertThat(client.closestModes(ModelSibling.CHEM, "apple", "factor", 2)).hasSize(1);
        assertThat(client.modes(ModelSibling.CORE, "binary")).hasSize(1);
        assertThat(client.modeMembers(ModelSibling.CORE, "F_0/M1", 1)).containsExactly("apple");
        assertThat(client.poles(ModelSibling.COOC, "taste:")).containsExactly("taste:savoury");
        server.verify();
    }

    @Test
    void translatesModelServiceFailures() {
        server.expect(requestTo("http://model-service/v1/models"))
                .andRespond(withServerError().body("backend unavailable"));

        assertThatThrownBy(() -> client.models())
                .isInstanceOf(ModelServiceException.class)
                .hasMessage("The model service could not complete the request.");
        server.verify();
    }

    @Test
    void rejectsEmptyResponsesAndUnavailableModelServices() {
        server.expect(requestTo("http://model-service/health"))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.health())
                .isInstanceOf(ModelServiceException.class)
                .hasMessage("The model service returned an empty response.");
        server.verify();

        RestClient unavailable = mock(RestClient.class);
        when(unavailable.get()).thenThrow(new ResourceAccessException("offline"));

        assertThatThrownBy(() -> new EpicureModelClient(unavailable).health())
                .isInstanceOf(ModelServiceException.class)
                .hasMessage("Could not reach the model service within the configured timeout.");
    }
}
