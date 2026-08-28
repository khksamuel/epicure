package com.epicure.platform.infrastructure.model;

import com.epicure.platform.domain.model.ModelSibling;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

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
}
